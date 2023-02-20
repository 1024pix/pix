import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection';
import settings from '../../config';
import BookshelfUser from '../orm-models/User';
import BookshelfMembership from '../orm-models/Membership';
import BookshelfUserOrgaSettings from '../orm-models/UserOrgaSettings';
import bookshelfToDomainConverter from '../utils/bookshelf-to-domain-converter';
import { ForbiddenAccess, UserNotFoundError } from '../../domain/errors';
import Prescriber from '../../domain/read-models/Prescriber';

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
  const currentOrganizationId = prescriber.userOrgaSettings.currentOrganization.id;
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

async function _getParticipantCount(prescriber) {
  const currentOrganizationId = prescriber.userOrgaSettings.currentOrganization.id;

  const { count: allCounts } = await knex('organization-learners')
    .count('organization-learners.id')
    .leftJoin('users', 'users.id', 'organization-learners.userId')
    .where('isAnonymous', false)
    .where('organizationId', currentOrganizationId)
    .where('isDisabled', false)
    .first();

  prescriber.participantCount = allCounts;
}

export default {
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
      await _getParticipantCount(prescriber);

      return prescriber;
    } catch (err) {
      if (err instanceof BookshelfUser.NotFoundError) {
        throw new UserNotFoundError(`User not found for ID ${userId}`);
      }
      throw err;
    }
  },
};
