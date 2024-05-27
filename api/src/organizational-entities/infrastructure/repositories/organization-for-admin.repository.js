import _ from 'lodash';

import { knex } from '../../../../db/knex-database-connection.js';
import { MissingAttributesError, NotFoundError } from '../../../../lib/domain/errors.js';
import { OrganizationInvitation } from '../../../../lib/domain/models/OrganizationInvitation.js';
import { Tag } from '../../../../lib/domain/models/Tag.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { ORGANIZATION_FEATURE } from '../../../shared/domain/constants.js';
import { OrganizationForAdmin } from '../../domain/models/OrganizationForAdmin.js';

const DATA_PROTECTION_OFFICERS_TABLE_NAME = 'data-protection-officers';
const ORGANIZATION_FEATURES_TABLE_NAME = 'organization-features';
const ORGANIZATION_TAGS_TABLE_NAME = 'organization-tags';
const ORGANIZATIONS_TABLE_NAME = 'organizations';

/**
 * @type {function}
 * @param {Object} params
 * @param {string|number} params.id
 * @param {string|number} params.archivedBy
 * @return {Promise<void|MissingAttributesError>}
 */
const archive = async function ({ id, archivedBy }) {
  if (!archivedBy) {
    throw new MissingAttributesError();
  }

  const archiveDate = new Date();

  await knex('organization-invitations')
    .where({ organizationId: id, status: OrganizationInvitation.StatusType.PENDING })
    .update({ status: OrganizationInvitation.StatusType.CANCELLED, updatedAt: archiveDate });

  await knex('campaigns').where({ organizationId: id, archivedAt: null }).update({ archivedAt: archiveDate });

  await knex('memberships').where({ organizationId: id, disabledAt: null }).update({ disabledAt: archiveDate });

  await knex(ORGANIZATIONS_TABLE_NAME)
    .where({ id: id, archivedBy: null })
    .update({ archivedBy: archivedBy, archivedAt: archiveDate });
};

/**
 * @type {function}
 * @param {string|number} organizationId
 * @return {Promise<boolean>}
 */
const exist = async function (organizationId) {
  const organization = await knex(ORGANIZATIONS_TABLE_NAME).where({ id: organizationId }).first();
  return Boolean(organization);
};

/**
 * @type {function}
 * @param {string|number} parentOrganizationId
 * @return {Promise<OrganizationForAdmin[]>}
 */
const findChildrenByParentOrganizationId = async function (parentOrganizationId) {
  const children = await knex(ORGANIZATIONS_TABLE_NAME).where({ parentOrganizationId }).orderBy('name', 'ASC');
  return children.map(_toDomain);
};

/**
 * @type {function}
 * @param {string|number} id
 * @param {DomainTransaction} domainTransaction
 * @return {Promise<OrganizationForAdmin|NotFoundError>}
 */
const get = async function (id, domainTransaction = DomainTransaction.emptyTransaction()) {
  const knexConn = domainTransaction.transaction ?? knex;
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
    })
    .leftJoin('users AS archivists', 'archivists.id', 'organizations.archivedBy')
    .leftJoin('users AS creators', 'creators.id', 'organizations.createdBy')
    .leftJoin(
      'data-protection-officers AS dataProtectionOfficers',
      'dataProtectionOfficers.organizationId',
      'organizations.id',
    )
    .leftJoin('organizations AS parentOrganizations', 'parentOrganizations.id', 'organizations.parentOrganizationId')
    .where('organizations.id', id)
    .first();

  if (!organization) {
    throw new NotFoundError(`Not found organization for ID ${id}`);
  }

  const tags = await knexConn('tags')
    .select('tags.*')
    .join(ORGANIZATION_TAGS_TABLE_NAME, 'organization-tags.tagId', 'tags.id')
    .where('organization-tags.organizationId', organization.id);

  const availableFeatures = await knexConn('features')
    .select('key', knex.raw('"organization-features"."organizationId" IS NOT NULL as enabled'))
    .leftJoin(ORGANIZATION_FEATURES_TABLE_NAME, function () {
      this.on('features.id', 'organization-features.featureId').andOn(
        'organization-features.organizationId',
        organization.id,
      );
    });

  organization.features = availableFeatures.reduce(
    (features, { key, enabled }) => ({ ...features, [key]: enabled }),
    {},
  );

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
const save = async function (organization) {
  const data = _.pick(organization, ['name', 'type', 'documentationUrl', 'credit', 'createdBy']);
  const [organizationCreated] = await knex(ORGANIZATIONS_TABLE_NAME).returning('*').insert(data);
  const savedOrganization = _toDomain(organizationCreated);

  if (!_.isEmpty(savedOrganization.features)) {
    await _enableFeatures(knex, savedOrganization.features, savedOrganization.id);
  }
  return savedOrganization;
};

/**
 * @type {function}
 * @param {OrganizationForAdmin} organization
 * @param {DomainTransaction} domainTransaction
 * @return {Promise<void>}
 */
const update = async function (organization, domainTransaction = DomainTransaction.emptyTransaction()) {
  const knexConn = domainTransaction.transaction ?? knex;
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
  ]);

  await _enableFeatures(knexConn, organization.features, organization.id);
  await _disableFeatures(knexConn, organization.features, organization.id);

  await _addOrUpdateDataProtectionOfficer(knexConn, organization.dataProtectionOfficer);

  await _addTags(knexConn, organization.tagsToAdd);
  await _removeTags(knexConn, organization.tagsToRemove);

  await knexConn(ORGANIZATIONS_TABLE_NAME).update(organizationRawData).where({ id: organization.id });
};

/**
 * @typedef {Object} OrganizationForAdminRepository
 * @property {archive} archive
 * @property {exist} exist
 * @property {findChildrenByParentOrganizationId} findChildrenByParentOrganizationId
 * @property {get} get
 * @property {save} save
 * @property {update} update
 */
export const organizationForAdminRepository = { archive, exist, findChildrenByParentOrganizationId, get, save, update };

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
      _.keys(features).filter((key) => features[key] === false),
    )
    .delete();
}

async function _enableFeatures(knexConn, featuresToEnable, organizationId) {
  const features = await knexConn('features');
  const importFormats = await knexConn('organization-learner-import-formats').select('name', 'id');

  await knexConn(ORGANIZATION_FEATURES_TABLE_NAME)
    .insert(
      _.keys(featuresToEnable)
        .filter((key) => featuresToEnable[key])
        .map((key) => ({
          organizationId,
          featureId: features.find((feature) => feature.key === key).id,
          params: _paramsForFeature(importFormats, key, featuresToEnable[key]),
        })),
    )
    .onConflict()
    .ignore();
}

function _paramsForFeature(importFormats, key, value) {
  if (key === ORGANIZATION_FEATURE.LEARNER_IMPORT.key) {
    const learnerImportFormat = importFormats.find(({ name }) => name === value);
    return { organizationLearnerImportFormatId: learnerImportFormat.id };
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
  });

  return organization;
}
