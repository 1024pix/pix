const BookshelfMembership = require('../data/membership');
const { MembershipCreationError } = require('../../domain/errors');
const Membership = require('../../domain/models/Membership');
const Organization = require('../../domain/models/Organization');
const OrganizationRole = require('../../domain/models/OrganizationRole');
const User = require('../../domain/models/User');
const bookshelfUtils = require('../utils/bookshelf-utils');

function _toDomain(bookshelfMembership) {

  const membership = new Membership({ id: bookshelfMembership.id });

  if (bookshelfMembership.relations.organization) {
    membership.organization = new Organization(bookshelfMembership.relations.organization.toJSON());
  }

  if (bookshelfMembership.relations.organizationRole) {
    membership.organizationRole = new OrganizationRole(bookshelfMembership.relations.organizationRole.toJSON());
  }

  if (bookshelfMembership.relations.user) {
    membership.user = new User(bookshelfMembership.relations.user.toJSON());
  }

  return membership;
}

module.exports = {

  create(userId, organizationId, organizationRoleId) {
    return new BookshelfMembership({ userId, organizationId, organizationRoleId })
      .save()
      .then((bookshelfMembership) => bookshelfMembership.load(['organization', 'organizationRole', 'user']))
      .then(_toDomain)
      .catch((err) => {
        if (bookshelfUtils.isUniqConstraintViolated(err)) {
          throw new MembershipCreationError();
        }
        throw err;
      });
  },

  findByOrganizationId(organizationId) {
    return BookshelfMembership
      .where({ organizationId })
      .fetchAll({ withRelated: ['organization', 'organizationRole', 'user'] })
      .then((bookshelfMembershipCollection) => bookshelfMembershipCollection.map(_toDomain));
  }
};
