const _ = require('lodash');
const { knex } = require('../bookshelf');
const settings = require('../../config');
const BookshelfUser = require('../orm-models/User');
const BookshelfMembership = require('../orm-models/Membership');
const BookshelfUserOrgaSettings = require('../orm-models/UserOrgaSettings');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { ForbiddenAccess, UserNotFoundError } = require('../../domain/errors');
const Prescriber = require('../../domain/read-models/Prescriber');

function _toPrescriberDomain(bookshelfUser) {
  const { id, firstName, lastName, pixOrgaTermsOfServiceAccepted, lang } = bookshelfUser.toJSON();
  return new Prescriber({
    id,
    firstName,
    lastName,
    pixOrgaTermsOfServiceAccepted,
    lang,
    memberships: bookshelfToDomainConverter.buildDomainObjects(
      BookshelfMembership,
      bookshelfUser.related('memberships')
    ),
    userOrgaSettings: bookshelfToDomainConverter.buildDomainObject(
      BookshelfUserOrgaSettings,
      bookshelfUser.related('userOrgaSettings')
    ),
  });
}

async function _areNewYearOrganizationLearnersImportedForPrescriber(prescriber) {
  const currentOrganizationId = prescriber.userOrgaSettings.id
    ? prescriber.userOrgaSettings.currentOrganization.id
    : prescriber.memberships[0].organization.id;
  const atLeastOneOrganizationLearner = await knex('organizations')
    .select('organizations.id')
    .join('organization-learners', 'organization-learners.organizationId', 'organizations.id')
    .where((qb) => {
      qb.where('organizations.id', currentOrganizationId);
      if (settings.features.newYearOrganizationLearnersImportDate) {
        qb.where('organization-learners.createdAt', '>=', settings.features.newYearOrganizationLearnersImportDate);
      }
    })
    .first();

  prescriber.areNewYearOrganizationLearnersImported = Boolean(atLeastOneOrganizationLearner);
}

module.exports = {
  async getPrescriber(userId) {
    try {
      const prescriberFromDB = await BookshelfUser.where({ id: userId }).fetch({
        columns: ['id', 'firstName', 'lastName', 'pixOrgaTermsOfServiceAccepted', 'lang'],
        withRelated: [
          { memberships: (qb) => qb.where({ disabledAt: null }).orderBy('id') },
          'memberships.organization',
          'userOrgaSettings',
          'userOrgaSettings.currentOrganization',
          'userOrgaSettings.currentOrganization.tags',
        ],
      });
      const prescriber = _toPrescriberDomain(prescriberFromDB);

      if (_.isEmpty(prescriber.memberships)) {
        throw new ForbiddenAccess(`User of ID ${userId} is not a prescriber`);
      }

      await _areNewYearOrganizationLearnersImportedForPrescriber(prescriber);

      return prescriber;
    } catch (error) {
      if (error instanceof BookshelfUser.NotFoundError) {
        throw new UserNotFoundError(`User not found for ID ${userId}`);
      }
      throw error;
    }
  },
};
