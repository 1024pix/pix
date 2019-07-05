const BookshelfMembership = require('../data/membership');
const { MembershipCreationError } = require('../../domain/errors');
const Membership = require('../../domain/models/Membership');
const User = require('../../domain/models/User');
const bookshelfUtils = require('../utils/bookshelf-utils');

function _toDomain(bookshelfMembership) {
  const membership = new Membership(bookshelfMembership.toJSON());

  membership.user = new User(bookshelfMembership.relations.user.toJSON());

  return membership;
}

module.exports = {

  create(userId, organizationId, organizationRole) {
    return new BookshelfMembership({ userId, organizationId, organizationRole })
      .save()
      .then((bookshelfMembership) => bookshelfMembership.load(['user']))
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
      .orderBy('id', 'ASC')
      .fetchAll({ withRelated: ['user'] })
      .then((bookshelfMembershipCollection) => bookshelfMembershipCollection.map(_toDomain));
  }
};
