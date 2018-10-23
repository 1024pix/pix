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
  });

  let members = [];
  if (rawOrganization.organizationAccesses) {
    members = rawOrganization.organizationAccesses.map((organizationAccess) => {
      return new User({
        id: organizationAccess.user.id,
        firstName: organizationAccess.user.firstName,
        lastName: organizationAccess.user.lastName,
        email: organizationAccess.user.email,
      });
    });
  }
  organization.members = members;

  return organization;
}

module.exports = {

  create(domainOrganization) {
    const organizationRawData = _.omit(domainOrganization, ['user', 'members', 'targetProfileShares']);
    return new BookshelfOrganization(organizationRawData)
      .save()
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
          'organizationAccesses.user',
          'organizationAccesses.organizationRole',
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

