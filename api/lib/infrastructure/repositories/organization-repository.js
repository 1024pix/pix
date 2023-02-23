const _ = require('lodash');
const { NotFoundError } = require('../../domain/errors.js');
const Organization = require('../../domain/models/Organization.js');
const DomainTransaction = require('../DomainTransaction.js');
const { knex } = require('../../../db/knex-database-connection.js');
const Tag = require('../../domain/models/Tag.js');
const { fetchPage } = require('../utils/knex-utils.js');

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
  const { id, name, type, externalId } = filter;
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
}

module.exports = {
  create(organization) {
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

    return knex('organizations')
      .insert(organizationRawData)
      .returning('*')
      .then(([organization]) => _toDomain(organization));
  },

  async batchCreateOrganizations(organizations, domainTransaction = DomainTransaction.emptyTransaction()) {
    const organizationsRawData = organizations.map((organization) =>
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
      ])
    );
    return knex
      .batchInsert('organizations', organizationsRawData)
      .transacting(domainTransaction.knexTransaction)
      .returning(['id', 'externalId', 'name']);
  },

  async update(organization) {
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

    const [organizationDB] = await knex('organizations')
      .update(organizationRawData)
      .where({ id: organization.id })
      .returning('*');

    const tagsDB = await knex('tags')
      .select(['tags.id', 'tags.name'])
      .join('organization-tags', 'organization-tags.tagId', 'tags.id')
      .where('organization-tags.organizationId', organizationDB.id);

    const tags = tagsDB.map((tagDB) => new Tag(tagDB));

    return _toDomain({ ...organizationDB, tags });
  },

  async get(id) {
    const organizationDB = await knex('organizations').where({ id }).first();
    if (!organizationDB) {
      throw new NotFoundError(`Not found organization for ID ${id}`);
    }

    const tagsDB = await knex('tags')
      .select(['tags.id', 'tags.name'])
      .join('organization-tags', 'organization-tags.tagId', 'tags.id')
      .where('organization-tags.organizationId', id);

    const tags = tagsDB.map((tagDB) => new Tag(tagDB));
    return _toDomain({ ...organizationDB, tags });
  },

  async getIdByCertificationCenterId(certificationCenterId) {
    const organizationIds = await knex
      .pluck('organizations.id')
      .from('organizations')
      .innerJoin('certification-centers', function () {
        this.on('certification-centers.externalId', 'organizations.externalId').andOn(
          'certification-centers.type',
          'organizations.type'
        );
      })
      .where('certification-centers.id', certificationCenterId);

    if (organizationIds.length !== 1)
      throw new NotFoundError(`Not found organization for certification center id ${certificationCenterId}`);
    return organizationIds[0];
  },

  async getScoOrganizationByExternalId(externalId) {
    const organizationDB = await knex('organizations')
      .where({ type: Organization.types.SCO })
      .whereRaw('LOWER("externalId") = ?', externalId.toLowerCase())
      .first();

    if (!organizationDB) {
      throw new NotFoundError(`Could not find organization for externalId ${externalId}.`);
    }
    return _toDomain(organizationDB);
  },

  async findByExternalIdsFetchingIdsOnly(externalIds) {
    const organizationsDB = await knex('organizations')
      .whereInArray('externalId', externalIds)
      .select(['id', 'externalId']);

    return organizationsDB.map((model) => _toDomain(model));
  },

  async findScoOrganizationsByUai({ uai }) {
    const organizationsDB = await knex('organizations')
      .where({ type: Organization.types.SCO })
      .whereRaw('LOWER("externalId") = ? ', `${uai.toLowerCase()}`);

    return organizationsDB.map((model) => _toDomain(model));
  },

  async findPaginatedFiltered({ filter, page }) {
    const query = knex('organizations').modify(_setSearchFiltersForQueryBuilder, filter);

    const { results, pagination } = await fetchPage(query, page);
    const organizations = results.map((model) => _toDomain(model));
    return { models: organizations, pagination };
  },

  async findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page }) {
    const query = knex('organizations')
      .select('organizations.*')
      .innerJoin('target-profile-shares', 'organizations.id', 'target-profile-shares.organizationId')
      .where({ 'target-profile-shares.targetProfileId': targetProfileId })
      .modify(_setSearchFiltersForQueryBuilder, filter);

    const { results, pagination } = await fetchPage(query, page);
    const organizations = results.map((model) => _toDomain(model));
    return { models: organizations, pagination };
  },
};
