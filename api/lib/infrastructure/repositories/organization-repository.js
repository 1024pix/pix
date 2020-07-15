const _ = require('lodash');
const { NotFoundError } = require('../../domain/errors');
const BookshelfOrganization = require('../data/organization');
const Organization = require('../../domain/models/Organization');
const User = require('../../domain/models/User');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

function _toDomain(bookshelfOrganization) {

  const rawOrganization = bookshelfOrganization.toJSON();

  const organization = new Organization({
    id: rawOrganization.id,
    name: rawOrganization.name,
    type: rawOrganization.type,
    logoUrl: rawOrganization.logoUrl,
    externalId: rawOrganization.externalId,
    provinceCode: rawOrganization.provinceCode,
    isManagingStudents: Boolean(rawOrganization.isManagingStudents),
    credit: rawOrganization.credit,
    canCollectProfiles: Boolean(rawOrganization.canCollectProfiles),
    email: rawOrganization.email
  });

  let members = [];
  if (rawOrganization.memberships) {
    members = rawOrganization.memberships.map((membership) => {
      return new User({
        id: membership.user.id,
        firstName: membership.user.firstName,
        lastName: membership.user.lastName,
        email: membership.user.email,
      });
    });
  }
  organization.members = members;

  organization.targetProfileShares = rawOrganization.targetProfileShares || [];

  return organization;
}

function _setSearchFiltersForQueryBuilder(filter, qb) {
  const { name, type, externalId } = filter;
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

    const organizationRawData = _.pick(organization, ['name', 'type', 'logoUrl', 'externalId', 'provinceCode']);

    return new BookshelfOrganization()
      .save(organizationRawData)
      .then(_toDomain);
  },

  update(organization) {

    const organizationRawData = _.pick(organization, ['name', 'type', 'logoUrl', 'externalId', 'provinceCode', 'isManagingStudents', 'email']);

    return new BookshelfOrganization({ id: organization.id })
      .save(organizationRawData, { patch: true })
      .then((model) => model.refresh())
      .then(_toDomain);
  },

  get(id) {
    return BookshelfOrganization
      .where({ id })
      .fetch({
        require: true,
        withRelated: [
          { 'memberships': (qb) => qb.where({ disabledAt: null }) },
          'memberships.user',
          'targetProfileShares.targetProfile',
        ],
      })
      .then(_toDomain)
      .catch((err) => {
        if (err instanceof BookshelfOrganization.NotFoundError) {
          throw new NotFoundError(`Not found organization for ID ${id}`);
        }
        throw err;
      });
  },

  findByExternalIdsFetchingIdsOnly(externalIds) {
    return BookshelfOrganization
      .where('externalId', 'in', externalIds)
      .fetchAll({ columns: ['id', 'externalId'] })
      .then((organizations) => organizations.models.map(_toDomain));
  },

  findScoOrganizationByUai(uai) {
    return BookshelfOrganization
      .where({ externalId: uai, type: Organization.types.SCO })
      .fetchAll({ columns: ['id', 'type', 'externalId', 'email'] })
      .then((organizations) => organizations.models.map(_toDomain));
  },

  findPaginatedFiltered({ filter, page }) {
    return BookshelfOrganization
      .query((qb) => _setSearchFiltersForQueryBuilder(filter, qb))
      .fetchPage({
        page: page.number,
        pageSize: page.size
      })
      .then(({ models, pagination }) => {
        const organizations = bookshelfToDomainConverter.buildDomainObjects(BookshelfOrganization, models);
        return { models: organizations, pagination };
      });
  },
};
