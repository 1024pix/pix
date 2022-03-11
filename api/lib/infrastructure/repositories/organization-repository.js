const _ = require('lodash');
const { NotFoundError } = require('../../domain/errors');
const Bookshelf = require('../bookshelf');
const BookshelfOrganization = require('../orm-models/Organization');
const Organization = require('../../domain/models/Organization');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const DomainTransaction = require('../DomainTransaction');
const { knex } = require('../../../db/knex-database-connection');

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_NUMBER = 1;

function _toDomain(rawOrganization) {
  const organization = new Organization({
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
    showNPS: rawOrganization.showNPS,
    formNPSUrl: rawOrganization.formNPSUrl,
    showSkills: rawOrganization.showSkills,
    archivedAt: rawOrganization.archivedAt,
  });

  organization.targetProfileShares = rawOrganization.targetProfileShares || [];
  organization.tags = rawOrganization.tags || [];

  return organization;
}

function _setSearchFiltersForQueryBuilder(filter, qb) {
  const { id, name, type, externalId } = filter;
  if (id) {
    qb.where('organizations.id', id);
  }
  if (name) {
    qb.whereRaw('LOWER("name") LIKE ?', `%${name.toLowerCase()}%`);
  }
  if (type) {
    qb.whereRaw('LOWER("type") LIKE ?', `%${type.toLowerCase()}%`);
  }
  if (externalId) {
    qb.whereRaw('LOWER("externalId") LIKE ?', `%${externalId.toLowerCase()}%`);
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

  async batchCreateProOrganizations(organizations, domainTransaction = DomainTransaction.emptyTransaction()) {
    const organizationsRawData = organizations.map((organization) =>
      _.pick(organization, [
        'name',
        'type',
        'logoUrl',
        'externalId',
        'provinceCode',
        'email',
        'isManagingStudents',
        'credit',
        'createdBy',
        'documentationUrl',
      ])
    );
    return Bookshelf.knex
      .batchInsert('organizations', organizationsRawData)
      .transacting(domainTransaction.knexTransaction)
      .returning(['id', 'externalId', 'email', 'name']);
  },

  update(organization) {
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

    return new BookshelfOrganization({ id: organization.id })
      .save(organizationRawData, { patch: true })
      .then((model) => model.refresh({ withRelated: 'tags' }))
      .then((model) => model.toJSON())
      .then(_toDomain);
  },

  get(id) {
    return BookshelfOrganization.where({ id })
      .fetch({
        withRelated: ['targetProfileShares.targetProfile', 'tags'],
      })
      .then((model) => model.toJSON())
      .then(_toDomain)
      .catch((err) => {
        if (err instanceof BookshelfOrganization.NotFoundError) {
          throw new NotFoundError(`Not found organization for ID ${id}`);
        }
        throw err;
      });
  },

  async getIdByCertificationCenterId(certificationCenterId) {
    const bookshelfOrganization = await BookshelfOrganization.query((qb) => {
      qb.join('certification-centers', 'certification-centers.externalId', 'organizations.externalId');
      qb.where('certification-centers.id', '=', certificationCenterId);
    }).fetch({ require: false, columns: ['organizations.id'] });

    const id = _.get(bookshelfOrganization, 'attributes.id');
    if (id) return id;
    throw new NotFoundError(`Not found organization for certification center id ${certificationCenterId}`);
  },

  async getScoOrganizationByExternalId(externalId) {
    const organizationBookshelf = await BookshelfOrganization.query((qb) =>
      qb.where({ type: Organization.types.SCO }).whereRaw('LOWER("externalId") = ?', externalId.toLowerCase())
    ).fetch({ require: false });

    if (organizationBookshelf) {
      return _toDomain(organizationBookshelf.toJSON());
    }
    throw new NotFoundError(`Could not find organization for externalId ${externalId}.`);
  },

  findByExternalIdsFetchingIdsOnly(externalIds) {
    return BookshelfOrganization.where('externalId', 'in', externalIds)
      .fetchAll({ columns: ['id', 'externalId'] })
      .then((organizations) => organizations.models.map((model) => _toDomain(model.toJSON())));
  },

  findScoOrganizationByUai(uai) {
    return BookshelfOrganization.query((qb) =>
      qb.where({ type: Organization.types.SCO }).whereRaw('LOWER("externalId") = ? ', `${uai.toLowerCase()}`)
    )
      .fetchAll({ columns: ['id', 'type', 'externalId', 'email'] })
      .then((organizations) => organizations.models.map((model) => _toDomain(model.toJSON())));
  },

  findPaginatedFiltered({ filter, page }) {
    const pageSize = page.size ? page.size : DEFAULT_PAGE_SIZE;
    const pageNumber = page.number ? page.number : DEFAULT_PAGE_NUMBER;
    return BookshelfOrganization.query((qb) => _setSearchFiltersForQueryBuilder(filter, qb))
      .fetchPage({
        page: pageNumber,
        pageSize: pageSize,
      })
      .then(({ models, pagination }) => {
        const organizations = bookshelfToDomainConverter.buildDomainObjects(BookshelfOrganization, models);
        return { models: organizations, pagination };
      });
  },

  async findPaginatedFilteredByTargetProfile({ targetProfileId, filter, page }) {
    const pageSize = page.size ? page.size : DEFAULT_PAGE_SIZE;
    const pageNumber = page.number ? page.number : DEFAULT_PAGE_NUMBER;
    const { models, pagination } = await BookshelfOrganization.query((qb) => {
      qb.where({ 'target-profile-shares.targetProfileId': targetProfileId });
      _setSearchFiltersForQueryBuilder(filter, qb);
      qb.innerJoin('target-profile-shares', 'organizations.id', 'target-profile-shares.organizationId');
    }).fetchPage({
      page: pageNumber,
      pageSize,
    });
    const organizations = bookshelfToDomainConverter.buildDomainObjects(BookshelfOrganization, models);
    return { models: organizations, pagination };
  },
};
