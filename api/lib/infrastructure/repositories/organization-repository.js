const _ = require('lodash');
const { NotFoundError } = require('../../domain/errors');
const BookshelfOrganization = require('../data/organization');
const Organization = require('../../domain/models/Organization');
const User = require('../../domain/models/User');

function _toDomain(bookshelfOrganization) {

  const rawOrganization = bookshelfOrganization.toJSON();

  const organization = new Organization({
    id: rawOrganization.id,
    code: rawOrganization.code,
    name: rawOrganization.name,
    type: rawOrganization.type,
    logoUrl: rawOrganization.logoUrl,
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

module.exports = {

  create(organization) {

    const organizationRawData = _.pick(organization, ['name', 'type', 'logoUrl', 'code']);

    return new BookshelfOrganization()
      .save(organizationRawData)
      .then(_toDomain);
  },

  update(organization) {

    const organizationRawData = _.pick(organization, ['name', 'type', 'logoUrl']);

    return new BookshelfOrganization({ id: organization.id })
      .save(organizationRawData, { patch: true })
      .then((model) => model.refresh())
      .then(_toDomain);
  },

  isCodeAvailable(code) {
    return BookshelfOrganization
      .where({ code })
      .fetch()
      .then((organizations) => {

        if (organizations) {
          return Promise.reject();
        }

        return Promise.resolve(code);
      });
  },

  isOrganizationIdExist(id) {
    return BookshelfOrganization
      .where({ id })
      .fetch()
      .then((organizations) => !!organizations);
  },

  get(id) {
    return BookshelfOrganization
      .where({ id })
      .fetch({
        require: true,
        withRelated: [
          'memberships.user',
          'memberships.organizationRole',
          'targetProfileShares.targetProfile'
        ]
      })
      .then(_toDomain)
      .catch((err) => {
        if (err instanceof BookshelfOrganization.NotFoundError) {
          throw new NotFoundError(`Not found organization for ID ${id}`);
        }
        throw err;
      });
  },

  findBy(filters) {
    return BookshelfOrganization
      .where(filters)
      .fetchAll()
      .then((organizations) => organizations.models.map(_toDomain));
  },

  // TODO return domain object
  getByUserId(userId) {
    return BookshelfOrganization
      .where({ userId })
      .fetchAll()
      .then((organizations) => organizations.models);
  },
};

