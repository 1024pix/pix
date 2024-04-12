import bluebird from 'bluebird';
import _ from 'lodash';

import { knex } from '../../../../db/knex-database-connection.js';
import { Organization } from '../../../../lib/domain/models/Organization.js';
import { Tag } from '../../../../lib/domain/models/Tag.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { NotFoundError } from '../../domain/errors.js';
import { CONCURRENCY_HEAVY_OPERATIONS } from '../constants.js';
import { fetchPage } from '../utils/knex-utils.js';

const ORGANIZATIONS_TABLE_NAME = 'organizations';

function _toDomain(rawOrganization) {
  const organization = new Organization({
    id: rawOrganization.id,
    name: rawOrganization.name,
    type: rawOrganization.type,
    logoUrl: rawOrganization.logoUrl,
    externalId: rawOrganization.externalId,
    provinceCode: rawOrganization.provinceCode,
    isManagingStudents: Boolean(rawOrganization.isManagingStudents),
    identityProviderForCampaigns: rawOrganization.identityProviderForCampaigns,
    credit: rawOrganization.credit,
    email: rawOrganization.email,
    documentationUrl: rawOrganization.documentationUrl,
    createdBy: rawOrganization.createdBy,
    showNPS: rawOrganization.showNPS,
    formNPSUrl: rawOrganization.formNPSUrl,
    showSkills: rawOrganization.showSkills,
    archivedAt: rawOrganization.archivedAt,
  });

  organization.targetProfileShares = rawOrganization.targetProfileShares || [];
  organization.tags = rawOrganization.tags || [];

  return organization;
}

function _setSearchFiltersForQueryBuilder(qb, filter) {
  const { id, name, type, externalId, hideArchived } = filter;
  if (id) {
    qb.where('organizations.id', id);
  }
  if (name) {
    qb.whereILike('name', `%${name}%`);
  }
  if (type) {
    qb.whereILike('type', `%${type}%`);
  }
  if (externalId) {
    qb.whereILike('externalId', `%${externalId}%`);
  }
  if (hideArchived) {
    qb.whereNull('archivedAt');
  }
}

const create = function (organization) {
  const organizationRawData = _.pick(organization, [
    'name',
    'type',
    'logoUrl',
    'externalId',
    'provinceCode',
    'email',
    'isManagingStudents',
    'createdBy',
    'documentationUrl',
  ]);

  return knex(ORGANIZATIONS_TABLE_NAME)
    .insert(organizationRawData)
    .returning('*')
    .then(([organization]) => _toDomain(organization));
};

// Uses OrganizationForAdmin to centralize features enablement by organization type
const batchCreateOrganizations = async function (
  organizations,
  domainTransaction = DomainTransaction.emptyTransaction(),
) {
  const knexConn = domainTransaction.knexTransaction ?? knex;
  const featuresByKey = _.keyBy(await knexConn('features'), (feature) => feature.key);

  return bluebird.map(
    organizations,
    async (organizationCsvData) => {
      const { organization } = organizationCsvData;
      const [createdOrganization] = await knexConn(ORGANIZATIONS_TABLE_NAME)
        .insert(
          _.pick(organization, [
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
          ]),
        )
        .returning('*');

      const enabledFeatures = _.keys(organization.features).filter((key) => organization.features[key] === true);

      for (const featureKey of enabledFeatures) {
        const feature = featuresByKey[featureKey];
        await knexConn('organization-features').insert({
          organizationId: createdOrganization.id,
          featureId: feature.id,
        });
      }

      return {
        createdOrganization,
        organizationToCreate: organizationCsvData,
      };
    },
    {
      concurrency: CONCURRENCY_HEAVY_OPERATIONS,
    },
  );
};

const update = async function (organization) {
  const organizationRawData = _.pick(organization, [
    'name',
    'type',
    'logoUrl',
    'externalId',
    'provinceCode',
    'isManagingStudents',
    'email',
    'credit',
    'documentationUrl',
    'showSkills',
  ]);

  const [organizationDB] = await knex(ORGANIZATIONS_TABLE_NAME)
    .update(organizationRawData)
    .where({ id: organization.id })
    .returning('*');

  const tagsDB = await knex('tags')
    .select(['tags.id', 'tags.name'])
    .join('organization-tags', 'organization-tags.tagId', 'tags.id')
    .where('organization-tags.organizationId', organizationDB.id);

  const tags = tagsDB.map((tagDB) => new Tag(tagDB));

  return _toDomain({ ...organizationDB, tags });
};

const get = async function (id) {
  const organizationDB = await knex(ORGANIZATIONS_TABLE_NAME).where({ id }).first();
  if (!organizationDB) {
    throw new NotFoundError(`Not found organization for ID ${id}`);
  }

  const tagsDB = await knex('tags')
    .select(['tags.id', 'tags.name'])
    .join('organization-tags', 'organization-tags.tagId', 'tags.id')
    .where('organization-tags.organizationId', id);

  const tags = tagsDB.map((tagDB) => new Tag(tagDB));
  return _toDomain({ ...organizationDB, tags });
};

const getIdByCertificationCenterId = async function (certificationCenterId) {
  const organizationIds = await knex
    .pluck('organizations.id')
    .from(ORGANIZATIONS_TABLE_NAME)
    .innerJoin('certification-centers', function () {
      this.on('certification-centers.externalId', 'organizations.externalId').andOn(
        'certification-centers.type',
        'organizations.type',
      );
    })
    .where('certification-centers.id', certificationCenterId);

  if (organizationIds.length !== 1)
    throw new NotFoundError(`Not found organization for certification center id ${certificationCenterId}`);
  return organizationIds[0];
};

const getScoOrganizationByExternalId = async function (externalId) {
  const organizationDB = await knex(ORGANIZATIONS_TABLE_NAME)
    .where({ type: Organization.types.SCO })
    .whereRaw('LOWER("externalId") = ?', externalId.toLowerCase())
    .first();

  if (!organizationDB) {
    throw new NotFoundError(`Could not find organization for externalId ${externalId}.`);
  }
  return _toDomain(organizationDB);
};

const findByExternalIdsFetchingIdsOnly = async function (externalIds) {
  const organizationsDB = await knex(ORGANIZATIONS_TABLE_NAME)
    .whereInArray('externalId', externalIds)
    .select(['id', 'externalId']);

  return organizationsDB.map((model) => _toDomain(model));
};

const findScoOrganizationsByUai = async function ({ uai }) {
  const organizationsDB = await knex(ORGANIZATIONS_TABLE_NAME)
    .where({ type: Organization.types.SCO })
    .whereRaw('LOWER("externalId") = ? ', `${uai.toLowerCase()}`);

  return organizationsDB.map((model) => _toDomain(model));
};

const findPaginatedFiltered = async function ({ filter, page }) {
  const query = knex(ORGANIZATIONS_TABLE_NAME).modify(_setSearchFiltersForQueryBuilder, filter).orderBy('name', 'ASC');

  const { results, pagination } = await fetchPage(query, page);
  const organizations = results.map((model) => _toDomain(model));
  return { models: organizations, pagination };
};

const findPaginatedFilteredByTargetProfile = async function ({ targetProfileId, filter, page }) {
  const query = knex(ORGANIZATIONS_TABLE_NAME)
    .select('organizations.*')
    .innerJoin('target-profile-shares', 'organizations.id', 'target-profile-shares.organizationId')
    .where({ 'target-profile-shares.targetProfileId': targetProfileId })
    .modify(_setSearchFiltersForQueryBuilder, filter);

  const { results, pagination } = await fetchPage(query, page);
  const organizations = results.map((model) => _toDomain(model));
  return { models: organizations, pagination };
};

export {
  batchCreateOrganizations,
  create,
  findByExternalIdsFetchingIdsOnly,
  findPaginatedFiltered,
  findPaginatedFilteredByTargetProfile,
  findScoOrganizationsByUai,
  get,
  getIdByCertificationCenterId,
  getScoOrganizationByExternalId,
  update,
};
