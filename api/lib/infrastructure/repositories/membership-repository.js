const BookshelfMembership = require('../data/membership');
const { MembershipCreationError, MembershipUpdateError, NotFoundError } = require('../../domain/errors');
const Membership = require('../../domain/models/Membership');
const User = require('../../domain/models/User');
const Organization = require('../../domain/models/Organization');
const bookshelfUtils = require('../utils/knex-utils');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const DomainTransaction = require('../DomainTransaction');

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_NUMBER = 1;

function _toDomain(bookshelfMembership) {
  const membership = new Membership(bookshelfMembership.toJSON());

  if (bookshelfMembership.relations.user) {
    membership.user = new User(bookshelfMembership.relations.user.toJSON());
  }

  if (bookshelfMembership.relations.organization) {
    membership.organization = new Organization(bookshelfMembership.relations.organization.toJSON());
  }

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

  async get(membershipId) {
    let bookshelfMembership;
    try {
      bookshelfMembership = await BookshelfMembership.where('id', membershipId).fetch({ withRelated: ['user', 'organization'] });
    } catch (error) {
      if (error instanceof BookshelfMembership.NotFoundError) {
        throw new NotFoundError(`Membership ${membershipId} not found`);
      }
      throw error;
    }

    return _toDomain(bookshelfMembership);
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
        pageSize,
      });
    const memberships = bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, models);
    return { models: memberships, pagination };
  },

  findByUserIdAndOrganizationId({ userId, organizationId, includeOrganization = false }) {
    return BookshelfMembership
      .where({ userId, organizationId, disabledAt: null })
      .fetchAll({ withRelated: includeOrganization ? ['organization', 'organization.tags'] : [] })
      .then((memberships) => bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, memberships));
  },

  findByUserId({ userId }) {
    return BookshelfMembership
      .where({ userId, disabledAt: null })
      .fetchAll({ withRelated: ['organization'] })
      .then((memberships) => bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, memberships));
  },

  async updateById({ id, membership }, domainTransaction = DomainTransaction.emptyTransaction()) {
    let updatedMembership;
    try {
      updatedMembership = await new BookshelfMembership({ id })
        .save(membership, { patch: true, method: 'update', require: true, transacting: domainTransaction.knexTransaction });
    } catch (err) {
      throw new MembershipUpdateError(err.message);
    }

    const updatedMembershipWithUserAndOrganization = await updatedMembership.refresh({ withRelated: ['user', 'organization'], transacting: domainTransaction.knexTransaction });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfMembership, updatedMembershipWithUserAndOrganization);
  },

};

