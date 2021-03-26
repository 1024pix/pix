const _ = require('lodash');
const { knex } = require('../bookshelf');
const settings = require('../../config');
const BookshelfUser = require('../data/user');
const BookshelfMembership = require('../data/membership');
const BookshelfUserOrgaSettings = require('../data/user-orga-settings');
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
    memberships: bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, bookshelfUser.related('memberships')),
    userOrgaSettings: bookshelfToDomainConverter.buildDomainObject(BookshelfUserOrgaSettings, bookshelfUser.related('userOrgaSettings')),
  });
}

async function _areNewYearSchoolingRegistrationsImportedForPrescriber(prescriber) {
  const currentOrganizationId = prescriber.userOrgaSettings.id ?
    prescriber.userOrgaSettings.currentOrganization.id :
    prescriber.memberships[0].organization.id;
  const atLeastOneSchoolingRegistration = await knex('organizations')
    .select('organizations.id')
    .join('schooling-registrations', 'schooling-registrations.organizationId', 'organizations.id')
    .where((qb) => {
      qb.where('organizations.id', currentOrganizationId);
      if (settings.features.newYearSchoolingRegistrationsImportDate) {
        qb.where('schooling-registrations.createdAt', '>=', settings.features.newYearSchoolingRegistrationsImportDate);
      }
    })
    .first();

  prescriber.areNewYearSchoolingRegistrationsImported = Boolean(atLeastOneSchoolingRegistration);
}

module.exports = {

  async getPrescriber(userId) {
    try {
      const prescriberFromDB = await BookshelfUser
        .where({ id: userId })
        .fetch({
          columns: ['id', 'firstName', 'lastName', 'pixOrgaTermsOfServiceAccepted', 'lang'],
          withRelated: [
            { 'memberships': (qb) => qb.where({ disabledAt: null }).orderBy('id') },
            'memberships.organization',
            'userOrgaSettings',
            'userOrgaSettings.currentOrganization',
            'userOrgaSettings.currentOrganization.tags',
          ] });
      const prescriber = _toPrescriberDomain(prescriberFromDB);

      if (_.isEmpty(prescriber.memberships)) {
        throw new ForbiddenAccess(`User of ID ${userId} is not a prescriber`);
      }

      await _areNewYearSchoolingRegistrationsImportedForPrescriber(prescriber);

      return prescriber;
    } catch (err) {
      if (err instanceof BookshelfUser.NotFoundError) {
        throw new UserNotFoundError(`User not found for ID ${userId}`);
      }
      throw err;
    }
  },
};
