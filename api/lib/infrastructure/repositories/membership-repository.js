const BookshelfMembership = require('../data/membership');
const { MembershipCreationError, MembershipUpdateError } = require('../../domain/errors');
const Membership = require('../../domain/models/Membership');
const User = require('../../domain/models/User');
const bookshelfUtils = require('../utils/bookshelf-utils');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_NUMBER = 1;

function _toDomain(bookshelfMembership) {
  const membership = new Membership(bookshelfMembership.toJSON());

  membership.user = new User(bookshelfMembership.relations.user.toJSON());

  return membership;
}

function _setSearchFiltersForQueryBuilder(filter, qb) {
  const { firstName, lastName, email, organizationRole } = filter;
  if (firstName) {
    qb.whereRaw('LOWER(users."firstName") LIKE ?', `%${firstName.toLowerCase()}%`);
  }
  if (lastName) {
    qb.whereRaw('LOWER(users."lastName") LIKE ?', `%${lastName.toLowerCase()}%`);
  }
  if (email) {
    qb.whereRaw('LOWER(users."email") LIKE ?', `%${email.toLowerCase()}%`);
  }
  if (organizationRole) {
    qb.where('memberships.organizationRole', organizationRole);
  }
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

  async findByOrganizationId({ organizationId }) {
    const memberships = await BookshelfMembership
      .where({ organizationId, disabledAt: null })
      .orderBy('id', 'ASC')
      .fetchAll({ withRelated: ['user'] });
    return bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, memberships);
  },

  async findPaginatedFiltered({ organizationId, filter, page }) {
    const pageSize = page.size ? page.size : DEFAULT_PAGE_SIZE;
    const pageNumber = page.number ? page.number : DEFAULT_PAGE_NUMBER;
    const { models, pagination } = await BookshelfMembership
      .query((qb) => {
        qb.where({ 'memberships.organizationId': organizationId, 'memberships.disabledAt': null });
        _setSearchFiltersForQueryBuilder(filter, qb);
        qb.innerJoin('users', 'memberships.userId', 'users.id');
        qb.orderByRaw('"organizationRole" ASC, LOWER(users."lastName") ASC, LOWER(users."firstName") ASC');
      })
      .fetchPage({
        withRelated: ['user'],
        page: pageNumber,
        pageSize
      });
    const memberships = bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, models);
    return { models: memberships, pagination };
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

  updateById({ id, membershipAttributes }) {
    return new BookshelfMembership({ id })
      .save(membershipAttributes, { patch: true, method: 'update', require: true })
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

