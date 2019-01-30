const BookshelfMembership = require('../data/membership');
const { MembershipCreationError } = require('../../domain/errors');
const Membership = require('../../domain/models/Membership');
const OrganizationRole = require('../../domain/models/OrganizationRole');
const User = require('../../domain/models/User');
const bookshelfUtils = require('../utils/bookshelf-utils');

function _toDomain(bookshelfMembership) {

  const membership = new Membership({ id: bookshelfMembership.id });

  membership.organizationRole = new OrganizationRole(bookshelfMembership.relations.organizationRole.toJSON());

  membership.user = new User(bookshelfMembership.relations.user.toJSON());

  return membership;
}

module.exports = {

  create(userId, organizationId, organizationRoleId) {
    return new BookshelfMembership({ userId, organizationId, organizationRoleId })
      .save()
      .then((bookshelfMembership) => bookshelfMembership.load(['organizationRole', 'user']))
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
      .fetchAll({ withRelated: ['organizationRole', 'user'] })
      .then((bookshelfMembershipCollection) => bookshelfMembershipCollection.map(_toDomain));
  }
};
