import _ from 'lodash';

import { knex } from '../../../../db/knex-database-connection.js';
import { ORGANIZATION_FEATURE } from '../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { MissingAttributesError, NotFoundError } from '../../../shared/domain/errors.js';
import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';
import { fetchPage } from '../../../shared/infrastructure/utils/knex-utils.js';
import { OrganizationInvitation } from '../../../team/domain/models/OrganizationInvitation.js';
import { OrganizationForAdmin } from '../../domain/models/OrganizationForAdmin.js';
import { Tag } from '../../domain/models/Tag.js';

const DATA_PROTECTION_OFFICERS_TABLE_NAME = 'data-protection-officers';
const ORGANIZATION_FEATURES_TABLE_NAME = 'organization-features';
const ORGANIZATION_TAGS_TABLE_NAME = 'organization-tags';
const ORGANIZATIONS_TABLE_NAME = 'organizations';

/**
 * @type {function}
 * @param {Object} params
 * @param {string|number} params.id
 * @param {string|number} params.archivedBy
 * @return {Promise<void|MissingAttributesError|NotFoundError>}
 */
const archive = async function ({ id, archivedBy, campaignApi, learnerApi }) {
  const knexConnection = DomainTransaction.getConnection();
  const organization = await knexConnection(ORGANIZATIONS_TABLE_NAME).where({ id }).first();
  if (!organization) {
    throw new NotFoundError();
  }

  if (!archivedBy) {
    throw new MissingAttributesError();
  }

  const archiveDate = new Date();

  await knexConnection('organization-invitations')
    .where({ organizationId: id, status: OrganizationInvitation.StatusType.PENDING })
    .update({ status: OrganizationInvitation.StatusType.CANCELLED, updatedAt: archiveDate });

  const isAnonymizationWithDeletionEnabled = await featureToggles.get('isAnonymizationWithDeletionEnabled');
  if (isAnonymizationWithDeletionEnabled) {
    await learnerApi.deleteOrganizationLearnerBeforeImportFeature({
      userId: archivedBy,
      organizationId: id,
    });
    await campaignApi.deleteActiveCampaigns({ userId: archivedBy, organizationId: id });
  } else {
    await knexConnection('campaigns')
      .where({ organizationId: id, archivedAt: null })
      .update({ archivedAt: archiveDate });
  }

  await knexConnection('memberships')
    .where({ organizationId: id, disabledAt: null })
    .update({ disabledAt: archiveDate });

  await knexConnection(ORGANIZATIONS_TABLE_NAME)
    .where({ id: id, archivedBy: null })
    .update({ archivedBy: archivedBy, archivedAt: archiveDate });
};

/**
 * @type {function}
 * @param {string|number} organizationId
 * @return {Promise<boolean>}
 */
const exist = async function ({ organizationId }) {
  const knexConn = DomainTransaction.getConnection();
  const organization = await knexConn(ORGANIZATIONS_TABLE_NAME).where({ id: organizationId }).first();

  return Boolean(organization);
};

/**
 * @type {function}
 * @param {string|number} parentOrganizationId
 * @return {Promise<OrganizationForAdmin[]>}
 */
const findChildrenByParentOrganizationId = async function ({ parentOrganizationId }) {
  const knexConn = DomainTransaction.getConnection();
  const children = await knexConn(ORGANIZATIONS_TABLE_NAME).where({ parentOrganizationId }).orderBy('name', 'ASC');
  return children.map(_toDomain);
};

/**
 * @type {function}
 * @param {string|number} id
 * @return {Promise<OrganizationForAdmin|NotFoundError>}
 */
const get = async function ({ organizationId }) {
  const knexConn = DomainTransaction.getConnection();
  const organization = await knexConn(ORGANIZATIONS_TABLE_NAME)
    .select({
      id: 'organizations.id',
      name: 'organizations.name',
      type: 'organizations.type',
      logoUrl: 'organizations.logoUrl',
      externalId: 'organizations.externalId',
      provinceCode: 'organizations.provinceCode',
      isManagingStudents: 'organizations.isManagingStudents',
      credit: 'organizations.credit',
      email: 'organizations.email',
      documentationUrl: 'organizations.documentationUrl',
      createdBy: 'organizations.createdBy',
      createdAt: 'organizations.createdAt',
      showNPS: 'organizations.showNPS',
      formNPSUrl: 'organizations.formNPSUrl',
      showSkills: 'organizations.showSkills',
      archivedAt: 'organizations.archivedAt',
      archivistFirstName: 'archivists.firstName',
      archivistLastName: 'archivists.lastName',
      dataProtectionOfficerFirstName: 'dataProtectionOfficers.firstName',
      dataProtectionOfficerLastName: 'dataProtectionOfficers.lastName',
      dataProtectionOfficerEmail: 'dataProtectionOfficers.email',
      creatorFirstName: 'creators.firstName',
      creatorLastName: 'creators.lastName',
      identityProviderForCampaigns: 'organizations.identityProviderForCampaigns',
      parentOrganizationId: 'organizations.parentOrganizationId',
      parentOrganizationName: 'parentOrganizations.name',
      administrationTeamId: 'organizations.administrationTeamId',
      administrationTeamName: 'administrationTeams.name',
      countryCode: 'organizations.countryCode',
    })
    .leftJoin('users AS archivists', 'archivists.id', 'organizations.archivedBy')
    .leftJoin(
      'administration_teams AS administrationTeams',
      'administrationTeams.id',
      'organizations.administrationTeamId',
    )
    .leftJoin('users AS creators', 'creators.id', 'organizations.createdBy')
    .leftJoin(
      'data-protection-officers AS dataProtectionOfficers',
      'dataProtectionOfficers.organizationId',
      'organizations.id',
    )
    .leftJoin('organizations AS parentOrganizations', 'parentOrganizations.id', 'organizations.parentOrganizationId')
    .where('organizations.id', organizationId)
    .first();

  if (!organization) {
    throw new NotFoundError(`Not found organization for ID ${organizationId}`);
  }

  const tags = await knexConn('tags')
    .select('tags.*')
    .join(ORGANIZATION_TAGS_TABLE_NAME, 'organization-tags.tagId', 'tags.id')
    .where('organization-tags.organizationId', organization.id);

  const availableFeatures = await knexConn('features')
    .select(
      'key',
      'organization-features.params',
      knexConn.raw('"organization-features"."organizationId" IS NOT NULL as enabled'),
    )
    .leftJoin(ORGANIZATION_FEATURES_TABLE_NAME, function () {
      this.on('features.id', 'organization-features.featureId').andOn(
        'organization-features.organizationId',
        organization.id,
      );
    });

  const importFormats = await knexConn('organization-learner-import-formats');

  organization.features = availableFeatures.reduce((features, { key, enabled, params }) => {
    switch (key) {
      case ORGANIZATION_FEATURE.LEARNER_IMPORT.key:
        return {
          ...features,
          [key]: {
            active: enabled,
            params: enabled
              ? { name: importFormats.find(({ id }) => params.organizationLearnerImportFormatId === id).name }
              : null,
          },
        };
      case ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key:
      case ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key:
        return {
          ...features,
          [key]: {
            active: enabled,
            params,
          },
        };

      default:
        return { ...features, [key]: { active: enabled, params: null } };
    }
  }, {});

  organization.tags = tags.map((tag) => {
    return new Tag(tag);
  });

  return _toDomain(organization);
};

/**
 * @type {function}
 * @param {OrganizationForAdmin} organization
 * @return {Promise<OrganizationForAdmin>}
 */
const save = async function ({ organization }) {
  const knexConn = DomainTransaction.getConnection();
  const data = _.pick(organization, [
    'name',
    'type',
    'email',
    'externalId',
    'provinceCode',
    'isManagingStudents',
    'identityProviderForCampaigns',
    'credit',
    'createdBy',
    'documentationUrl',
    'administrationTeamId',
    'parentOrganizationId',
    'countryCode',
  ]);
  const [organizationCreated] = await knexConn(ORGANIZATIONS_TABLE_NAME).returning('*').insert(data);
  const savedOrganization = _toDomain(organizationCreated);

  if (!_.isEmpty(savedOrganization.features)) {
    await _enableFeatures(knexConn, savedOrganization.features, savedOrganization.id);
  }
  return savedOrganization;
};

/**
 * @type {function}
 * @param {OrganizationForAdmin} organization
 * @return {Promise<void>}
 */
const update = async function ({ organization }) {
  const knexConn = DomainTransaction.getConnection();
  const organizationRawData = _.pick(organization, [
    'credit',
    'documentationUrl',
    'email',
    'externalId',
    'identityProviderForCampaigns',
    'isManagingStudents',
    'logoUrl',
    'name',
    'parentOrganizationId',
    'provinceCode',
    'showSkills',
    'type',
    'administrationTeamId',
    'countryCode',
  ]);

  await _enableFeatures(knexConn, organization.features, organization.id);
  await _disableFeatures(knexConn, organization.features, organization.id);

  await _addOrUpdateDataProtectionOfficer(knexConn, organization.dataProtectionOfficer);

  await _addTags(knexConn, organization.tagsToAdd);
  await _removeTags(knexConn, organization.tagsToRemove);

  await knexConn(ORGANIZATIONS_TABLE_NAME)
    .update({ ...organizationRawData, updatedAt: new Date() })
    .where({ id: organization.id });
};

/**
 * @param {Object} params
 * @param {Object} params.filter
 * @param {number} params.page
 * @return {Promise<OrganizationForAdmin>}
 */
const findPaginatedFiltered = async function ({ filter, page }) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn(ORGANIZATIONS_TABLE_NAME)
    .select({
      id: 'organizations.id',
      name: 'organizations.name',
      type: 'organizations.type',
      externalId: 'organizations.externalId',
      archivedAt: 'organizations.archivedAt',
      administrationTeamId: 'organizations.administrationTeamId',
      administrationTeamName: 'administration_teams.name',
    })
    .leftJoin('administration_teams', 'administration_teams.id', 'organizations.administrationTeamId')
    .modify(_setSearchFiltersForQueryBuilder, filter)
    .orderBy('organizations.name', 'ASC');

  const { results, pagination } = await fetchPage({
    queryBuilder: query,
    paginationParams: page,
  });
  const organizations = results.map((model) => _toDomain(model));
  return { models: organizations, pagination };
};

/**
 * @param {Object} params
 * @param {string} params.organizationId
 * @param {string} params.email
 * @param {string} params.role
 * @param {string} params.locale
 * @param {OrganizationRepository} params.organizationRepository
 * @param {OrganizationApi} params.organizationApi
 * @returns {Promise<void>}
 */
const createProOrganizationInvitation = async function ({
  organizationId,
  email,
  role,
  locale,
  organizationRepository,
  organizationApi,
}) {
  await organizationApi.createProOrganizationInvitation({
    organizationId,
    email,
    role,
    locale,
    organizationRepository,
  });
};

async function _addOrUpdateDataProtectionOfficer(knexConn, dataProtectionOfficer) {
  await knexConn(DATA_PROTECTION_OFFICERS_TABLE_NAME)
    .insert(dataProtectionOfficer)
    .onConflict('organizationId')
    .merge();
}

async function _addTags(knexConn, organizationTags) {
  await knexConn(ORGANIZATION_TAGS_TABLE_NAME)
    .insert(organizationTags)
    .onConflict(['tagId', 'organizationId'])
    .ignore();
}

async function _disableFeatures(knexConn, features, organizationId) {
  await knexConn(ORGANIZATION_FEATURES_TABLE_NAME)
    .join('features', 'organization-features.featureId', 'features.id')
    .where('organization-features.organizationId', organizationId)
    .whereIn(
      'features.key',
      _.keys(
        // These features does not exist in database for now.
        _.omit(features, [
          ORGANIZATION_FEATURE.SHOW_SKILLS.key,
          ORGANIZATION_FEATURE.SHOW_NPS.key,
          ORGANIZATION_FEATURE.IS_MANAGING_STUDENTS.key,
        ]),
      ).filter((key) => features[key].active === false),
    )
    .delete();
}

async function _enableFeatures(knexConn, featuresToEnable, organizationId) {
  const features = await knexConn('features');
  const importFormats = await knexConn('organization-learner-import-formats').select('name', 'id');

  await knexConn(ORGANIZATION_FEATURES_TABLE_NAME)
    .insert(
      _.keys(
        // These features does not exist in database for now.
        _.omit(featuresToEnable, [
          ORGANIZATION_FEATURE.SHOW_SKILLS.key,
          ORGANIZATION_FEATURE.SHOW_NPS.key,
          ORGANIZATION_FEATURE.IS_MANAGING_STUDENTS.key,
        ]),
      )
        .filter((key) => featuresToEnable[key].active)
        .map((key) => ({
          organizationId,
          featureId: features.find((feature) => feature.key === key).id,
          params: _paramsForFeature(importFormats, key, featuresToEnable[key]),
        })),
    )
    .onConflict(['organizationId', 'featureId'])
    .merge(['params']);
}

function _setSearchFiltersForQueryBuilder(qb, filter) {
  const { id, name, type, externalId, hideArchived, administrationTeamId, targetProfileId, combinedCourseBlueprintId } =
    filter;
  if (id) {
    qb.where('organizations.id', id);
  }
  if (targetProfileId) {
    qb.join('target-profile-shares', 'organizationId', 'organizations.id').where({ targetProfileId });
  }
  if (combinedCourseBlueprintId) {
    qb.join('combined_course_blueprint_shares', 'organizationId', 'organizations.id').where({
      combinedCourseBlueprintId,
    });
  }
  if (name) {
    qb.where(
      knex.raw(
        `
      regexp_replace(unaccent(organizations.name), '[^[:alnum:]]', '', 'g')
      ILIKE
      '%' || regexp_replace(unaccent(?), '[^[:alnum:]]', '', 'g') || '%'
      `,
        [name],
      ),
    );
  }
  if (type) {
    qb.where('type', type);
  }
  if (externalId) {
    qb.whereILike('externalId', `%${externalId}%`);
  }
  if (hideArchived) {
    qb.whereNull('archivedAt');
  }

  if (administrationTeamId) {
    qb.where('administrationTeamId', administrationTeamId);
  }
}

function _paramsForFeature(importFormats, key, value) {
  if (key === ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key) {
    return JSON.stringify(value.params);
  }

  if (key === ORGANIZATION_FEATURE.LEARNER_IMPORT.key) {
    const learnerImportFormat = importFormats.find(({ name }) => name === value.params.name);
    return { organizationLearnerImportFormatId: learnerImportFormat.id };
  }

  if (key === ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key) {
    return { enableMaximumPlacesLimit: value.params?.enableMaximumPlacesLimit || false };
  }
}

async function _removeTags(knexConn, organizationTags) {
  await knexConn(ORGANIZATION_TAGS_TABLE_NAME)
    .whereIn(
      ['organizationId', 'tagId'],
      organizationTags.map((organizationTag) => [organizationTag.organizationId, organizationTag.tagId]),
    )
    .delete();
}

function _toDomain(rawOrganization) {
  const organization = new OrganizationForAdmin({
    id: rawOrganization.id,
    name: rawOrganization.name,
    type: rawOrganization.type,
    logoUrl: rawOrganization.logoUrl,
    externalId: rawOrganization.externalId,
    provinceCode: rawOrganization.provinceCode,
    isManagingStudents: Boolean(rawOrganization.isManagingStudents),
    credit: rawOrganization.credit,
    email: rawOrganization.email,
    documentationUrl: rawOrganization.documentationUrl,
    createdBy: rawOrganization.createdBy,
    createdAt: rawOrganization.createdAt,
    showNPS: rawOrganization.showNPS,
    formNPSUrl: rawOrganization.formNPSUrl,
    showSkills: rawOrganization.showSkills,
    archivedAt: rawOrganization.archivedAt,
    archivistFirstName: rawOrganization.archivistFirstName,
    archivistLastName: rawOrganization.archivistLastName,
    dataProtectionOfficerFirstName: rawOrganization.dataProtectionOfficerFirstName,
    dataProtectionOfficerLastName: rawOrganization.dataProtectionOfficerLastName,
    dataProtectionOfficerEmail: rawOrganization.dataProtectionOfficerEmail,
    creatorFirstName: rawOrganization.creatorFirstName,
    creatorLastName: rawOrganization.creatorLastName,
    identityProviderForCampaigns: rawOrganization.identityProviderForCampaigns,
    features: rawOrganization.features,
    tags: rawOrganization.tags || [],
    parentOrganizationId: rawOrganization.parentOrganizationId,
    parentOrganizationName: rawOrganization.parentOrganizationName,
    administrationTeamId: rawOrganization.administrationTeamId,
    administrationTeamName: rawOrganization.administrationTeamName,
    countryCode: rawOrganization.countryCode,
  });

  return organization;
}

export const organizationForAdminRepository = {
  archive,
  createProOrganizationInvitation,
  exist,
  findPaginatedFiltered,
  findChildrenByParentOrganizationId,
  get,
  save,
  update,
};
