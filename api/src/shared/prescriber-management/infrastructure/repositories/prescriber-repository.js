import _ from 'lodash';
import { knex } from '../../../../../db/knex-database-connection.js';
import { config } from '../../../../../lib/config.js';
import { BookshelfUser } from '../../../../../lib/infrastructure/orm-models/User.js';
import { BookshelfMembership } from '../../../../../lib/infrastructure/orm-models/Membership.js';
import { BookshelfUserOrgaSettings } from '../../../../../lib/infrastructure/orm-models/UserOrgaSettings.js';
import * as bookshelfToDomainConverter from '../../../../../lib/infrastructure/utils/bookshelf-to-domain-converter.js';
import { UserNotFoundError } from '../../../../../lib/domain/errors.js';
import { Prescriber } from '../../../../../lib/domain/read-models/Prescriber.js';
import { ForbiddenAccess } from '../../../../shared/domain/errors.js';
import { UserOrgaSettings } from '../../../../../lib/domain/models/UserOrgaSettings.js';
import { Organization } from '../../../../../lib/domain/models/Organization.js';
import { User } from '../../../../../lib/domain/models/User.js';
import { Tag } from '../../../../../lib/domain/models/Tag.js';
import { Membership } from '../../../../../lib/domain/models/index.js';

function _toPrescriberDomain(user, userOrgaSettings, tags, memberships, userOrganizations) {
  const { id, firstName, lastName, pixOrgaTermsOfServiceAccepted, lang } = user;
  return new Prescriber({
    id,
    firstName,
    lastName,
    pixOrgaTermsOfServiceAccepted,
    lang,
    memberships: memberships.map(
      (membership) =>
        new Membership({
          ...membership,
          organization: new Organization(
            userOrganizations.find((userOrganization) => userOrganization.id === membership.organizationId),
          ),
        }),
    ),
    userOrgaSettings: new UserOrgaSettings({
      id: userOrgaSettings.id,
      user: new User(),
      currentOrganization: new Organization({
        id: userOrgaSettings.currentOrganizationId,
        tags: tags.map((tag) => new Tag(tag)),
      }),
    }),
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
  const allFeatures = await _allFeatures();

  const organizationFeatures = allFeatures.reduce((accumulator, feature) => {
    return { ...accumulator, [feature]: availableFeatures.includes(feature) };
  }, {});

  prescriber.features = organizationFeatures;
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

const getPrescriber = async function (userId) {
  try {
    const prescriberFromDB = await knex('users')
      .select('id', 'firstName', 'lastName', 'pixOrgaTermsOfServiceAccepted', 'lang')
      .where({ id: userId })
      .first();

    const memberships = await knex('memberships').where({ userId, disabledAt: null }).orderBy('id');

    const userOrganizations = await knex('organizations').whereIn(
      'id',
      memberships.map((membership) => membership.organizationId),
    );

    if (memberships.length === 0) {
      throw new ForbiddenAccess(`User of ID ${userId} is not a prescriber`);
    }

    const userOrgaSettings = await knex('user-orga-settings').where({ userId }).first();
    const tags = await knex('tags')
      .join('organization-tags', 'organization-tags.tagId', 'tags.id')
      .where({ organizationId: userOrgaSettings.currentOrganizationId });
    const prescriber = _toPrescriberDomain(prescriberFromDB, userOrgaSettings, tags, memberships, userOrganizations);

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
