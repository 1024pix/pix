const BookshelfMembership = require('../data/membership');
const { MembershipCreationError, MembershipUpdateError } = require('../../domain/errors');
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
          throw new MembershipCreationError(err.message);
        }
        throw err;
      });
  },

  findByOrganizationId({ organizationId, orderByName = false }) {
    return BookshelfMembership
      .where({ organizationId, disabledAt: null })
      .query((qb) => {
        if (orderByName) {
          qb.innerJoin('users', 'memberships.userId', 'users.id');
          qb.orderByRaw('"organizationRole" ASC, LOWER(users."lastName") ASC, LOWER(users."firstName") ASC');
        } else {
          qb.orderBy('id', 'ASC');
        }
      })
      .fetchAll({ withRelated: ['user'] })
      .then((bookshelfMembershipCollection) => bookshelfMembershipCollection.map(_toDomain));
  },

  findByUserIdAndOrganizationId({ userId, organizationId, includeOrganization = false }) {
    return BookshelfMembership
      .where({ userId, organizationId, disabledAt: null })
      .fetchAll({ withRelated: includeOrganization ? ['organization'] : [] })
      .then((memberships) => bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, memberships));
  },

  isMembershipExistingByOrganizationIdAndEmail(organizationId, email) {
    return BookshelfMembership
      .where({ 'memberships.organizationId': organizationId, 'users.email': email })
      .query((qb) => {
        qb.innerJoin('users', 'users.id', 'memberships.userId');
      })
      .fetch({ require: true })
      .then(() => true)
      .catch(() => false);
  },

  updateRoleById({ id, organizationRole }) {
    return new BookshelfMembership({ id })
      .save({ organizationRole }, { patch: true, method: 'update', require: true })
      .then((updatedMembership) => updatedMembership.refresh({
        withRelated: ['user', 'organization']
      }))
      .then(
        (membership) => bookshelfToDomainConverter.buildDomainObject(BookshelfMembership, membership),
        (err) => {
          throw new MembershipUpdateError(err.message);
        }
      );
  },

};

