import { knex } from '../../../../db/knex-database-connection.js';
import { Membership } from '../../../../lib/domain/models/index.js';
import { UserOrgaSettings } from '../../../../lib/domain/models/UserOrgaSettings.js';
import { Organization } from '../../../organizational-entities/domain/models/Organization.js';
import { Tag } from '../../../organizational-entities/domain/models/Tag.js';
import { config } from '../../../shared/config.js';
import { ForbiddenAccess, UserNotFoundError } from '../../../shared/domain/errors.js';
import { Prescriber } from '../../domain/read-models/Prescriber.js';

/**
 * @param {string} userId
 * @return {Promise<Prescriber>}
 */
const getPrescriber = async function (userId) {
  const user = await knex('users')
    .select('id', 'firstName', 'lastName', 'pixOrgaTermsOfServiceAccepted', 'lang')
    .where({ id: userId })
    .first();

  if (!user) {
    throw new UserNotFoundError(`User not found for ID ${userId}`);
  }

  const memberships = await knex('memberships').where({ userId, disabledAt: null }).orderBy('id');

  if (memberships.length === 0) {
    throw new ForbiddenAccess(`User of ID ${userId} is not a prescriber`);
  }

  const organizationIds = memberships.map((membership) => membership.organizationId);
  const organizations = await knex('organizations').whereIn('id', organizationIds);
  const userOrgaSettings = await knex('user-orga-settings').where({ userId }).first();
  const tags = await knex('tags')
    .join('organization-tags', 'organization-tags.tagId', 'tags.id')
    .where({ organizationId: userOrgaSettings.currentOrganizationId });

  const schools = await knex('schools').whereIn('organizationId', organizationIds);

  const prescriber = _toPrescriberDomain(user, userOrgaSettings, tags, memberships, organizations, schools);

  const currentOrganizationId = prescriber.userOrgaSettings.currentOrganization.id;
  prescriber.areNewYearOrganizationLearnersImported =
    await _areNewYearOrganizationLearnersImportedForPrescriber(currentOrganizationId);
  prescriber.participantCount = await _getParticipantCount(currentOrganizationId);
  prescriber.features = await _organizationFeatures(currentOrganizationId);

  return prescriber;
};

export const prescriberRepository = { getPrescriber };

function _toPrescriberDomain(user, userOrgaSettings, tags, memberships, organizations, schools) {
  const currentSchool = schools.find((school) => school.organizationId === userOrgaSettings.currentOrganizationId);

  return new Prescriber({
    ...user,
    memberships: memberships.map(
      (membership) =>
        new Membership({
          ...membership,
          organization: new Organization({
            ...organizations.find((organization) => organization.id === membership.organizationId),
            schoolCode: schools.find((school) => school.organizationId === membership.organizationId)?.code,
          }),
        }),
    ),
    userOrgaSettings: new UserOrgaSettings({
      id: userOrgaSettings.id,
      currentOrganization: new Organization({
        ...organizations.find((organization) => organization.id === userOrgaSettings.currentOrganizationId),
        schoolCode: currentSchool?.code,
        sessionExpirationDate: currentSchool?.sessionExpirationDate,
        tags: tags.map((tag) => new Tag(tag)),
      }),
    }),
  });
}

async function _areNewYearOrganizationLearnersImportedForPrescriber(currentOrganizationId) {
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

  return Boolean(atLeastOneOrganizationLearner);
}

async function _getParticipantCount(currentOrganizationId) {
  const { count: allCounts } = await knex('view-active-organization-learners')
    .count('view-active-organization-learners.id')
    .leftJoin('users', 'users.id', 'view-active-organization-learners.userId')
    .where('isAnonymous', false)
    .where('organizationId', currentOrganizationId)
    .where('isDisabled', false)
    .first();

  return allCounts;
}

async function _organizationFeatures(currentOrganizationId) {
  const availableFeatures = await _availableFeaturesQueryBuilder(currentOrganizationId);
  const allFeatures = await _allFeatures();

  const organizationFeatures = allFeatures.reduce((accumulator, feature) => {
    return { ...accumulator, [feature]: availableFeatures.includes(feature) };
  }, {});

  return organizationFeatures;
}

function _allFeatures() {
  return knex('features').select('key').pluck('key');
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
