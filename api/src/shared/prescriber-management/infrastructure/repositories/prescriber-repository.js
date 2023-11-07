import _ from 'lodash';
import { knex } from '../../../../../db/knex-database-connection.js';
import { config } from '../../../../../lib/config.js';
import { BookshelfUser } from '../../../../../lib/infrastructure/orm-models/User.js';
import { BookshelfMembership } from '../../../../../lib/infrastructure/orm-models/Membership.js';
import { BookshelfUserOrgaSettings } from '../../../../../lib/infrastructure/orm-models/UserOrgaSettings.js';
import * as bookshelfToDomainConverter from '../../../../../lib/infrastructure/utils/bookshelf-to-domain-converter.js';
import { UserNotFoundError } from '../../../../../lib/domain/errors.js';
import { Prescriber } from '../../../../../lib/domain/read-models/Prescriber.js';
import * as apps from '../../../../../lib/domain/constants.js';
import { ForbiddenAccess } from '../../../../shared/domain/errors.js';

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
      bookshelfUser.related('memberships'),
    ),
    userOrgaSettings: bookshelfToDomainConverter.buildDomainObject(
      BookshelfUserOrgaSettings,
      bookshelfUser.related('userOrgaSettings'),
    ),
  });
}

async function _areNewYearOrganizationLearnersImportedForPrescriber(prescriber) {
  const currentOrganizationId = prescriber.userOrgaSettings.currentOrganization.id;
  const atLeastOneOrganizationLearner = await knex('organizations')
    .select('organizations.id')
    .join('view-active-organization-learners', 'view-active-organization-learners.organizationId', 'organizations.id')
    .where((qb) => {
      qb.where('organizations.id', currentOrganizationId);
      if (config.features.newYearOrganizationLearnersImportDate) {
        qb.where(
          'view-active-organization-learners.createdAt',
          '>=',
          config.features.newYearOrganizationLearnersImportDate,
        );
      }
    })
    .first();

  prescriber.areNewYearOrganizationLearnersImported = Boolean(atLeastOneOrganizationLearner);
}

async function _getParticipantCount(prescriber) {
  const currentOrganizationId = prescriber.userOrgaSettings.currentOrganization.id;

  const { count: allCounts } = await knex('view-active-organization-learners')
    .count('view-active-organization-learners.id')
    .leftJoin('users', 'users.id', 'view-active-organization-learners.userId')
    .where('isAnonymous', false)
    .where('organizationId', currentOrganizationId)
    .where('isDisabled', false)
    .first();

  prescriber.participantCount = allCounts;
}

async function _organizationFeatures(prescriber) {
  const currentOrganizationId = prescriber.userOrgaSettings.currentOrganization.id;
  const availableFeatures = await _availableFeaturesQueryBuilder(currentOrganizationId);

  prescriber.enableMultipleSendingAssessment = availableFeatures.includes(
    apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key,
  );

  prescriber.computeOrganizationLearnerCertificability = availableFeatures.includes(
    apps.ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key,
  );
}

function _availableFeaturesQueryBuilder(currentOrganizationId) {
  return knex('features')
    .select('key')
    .join('organization-features', function () {
      this.on('features.id', 'organization-features.featureId').andOn(
        'organization-features.organizationId',
        currentOrganizationId,
      );
    })
    .pluck('key');
}

const getPrescriber = async function (userId) {
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
    await _organizationFeatures(prescriber);

    return prescriber;
  } catch (err) {
    if (err instanceof BookshelfUser.NotFoundError) {
      throw new UserNotFoundError(`User not found for ID ${userId}`);
    }
    throw err;
  }
};

export { getPrescriber };
