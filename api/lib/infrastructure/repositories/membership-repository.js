const BookshelfMembership = require('../data/membership');
const { MembershipCreationError } = require('../../domain/errors');
const Membership = require('../../domain/models/Membership');
const User = require('../../domain/models/User');
const bookshelfUtils = require('../utils/bookshelf-utils');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

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

  findByOrganizationId({ organizationId, orderByName = false }) {
    return BookshelfMembership
      .where({ organizationId })
      .query((qb) => {
        if (orderByName) {
          qb.innerJoin('users', 'memberships.userId', 'users.id');
          qb.orderByRaw('LOWER(users."lastName") ASC, LOWER(users."firstName") ASC');
        } else {
          qb.orderBy('id', 'ASC');
        }
      })
      .fetchAll({ withRelated: ['user'] })
      .then((bookshelfMembershipCollection) => bookshelfMembershipCollection.map(_toDomain));
  },

  findByUserIdAndOrganizationId({ userId, organizationId, includeOrganization = false }) {
    return BookshelfMembership
      .where({ userId, organizationId })
      .fetchAll({ withRelated: includeOrganization ? ['organization'] : [] })
      .then((memberships) => bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, memberships));
  }
};
