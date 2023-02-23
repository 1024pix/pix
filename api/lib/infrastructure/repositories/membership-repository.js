const BookshelfMembership = require('../orm-models/Membership.js');
const { MembershipCreationError, MembershipUpdateError, NotFoundError } = require('../../domain/errors.js');
const Membership = require('../../domain/models/Membership.js');
const User = require('../../domain/models/User.js');
const Organization = require('../../domain/models/Organization.js');
const bookshelfUtils = require('../utils/knex-utils.js');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter.js');
const { knex } = require('../../../db/knex-database-connection.js');
const DomainTransaction = require('../DomainTransaction.js');

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
    qb.whereILike('users.firstName', `%${firstName}%`);
  }
  if (lastName) {
    qb.whereILike('users.lastName', `%${lastName}%`);
  }
  if (email) {
    qb.whereILike('users.email', `%${email}%`);
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
      bookshelfMembership = await BookshelfMembership.where('id', membershipId).fetch({
        withRelated: ['user', 'organization'],
      });
    } catch (error) {
      if (error instanceof BookshelfMembership.NotFoundError) {
        throw new NotFoundError(`Membership ${membershipId} not found`);
      }
      throw error;
    }

    return _toDomain(bookshelfMembership);
  },

  async findByOrganizationId({ organizationId }) {
    const memberships = await BookshelfMembership.where({ organizationId, disabledAt: null })
      .orderBy('id', 'ASC')
      .fetchAll({ withRelated: ['user'] });
    return bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, memberships);
  },

  async findPaginatedFiltered({ organizationId, filter, page }) {
    const pageSize = page.size ? page.size : DEFAULT_PAGE_SIZE;
    const pageNumber = page.number ? page.number : DEFAULT_PAGE_NUMBER;
    const { models, pagination } = await BookshelfMembership.query((qb) => {
      qb.where({ 'memberships.organizationId': organizationId, 'memberships.disabledAt': null });
      _setSearchFiltersForQueryBuilder(filter, qb);
      qb.innerJoin('users', 'memberships.userId', 'users.id');
      qb.orderByRaw('"organizationRole" ASC, LOWER(users."lastName") ASC, LOWER(users."firstName") ASC');
    }).fetchPage({
      withRelated: ['user'],
      page: pageNumber,
      pageSize,
    });
    const memberships = bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, models);
    return { models: memberships, pagination };
  },

  findByUserIdAndOrganizationId({ userId, organizationId, includeOrganization = false }) {
    return BookshelfMembership.where({ userId, organizationId, disabledAt: null })
      .fetchAll({ withRelated: includeOrganization ? ['organization', 'organization.tags'] : [] })
      .then((memberships) => bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, memberships));
  },

  findByUserId({ userId }) {
    return BookshelfMembership.where({ userId, disabledAt: null })
      .fetchAll({ withRelated: ['organization'] })
      .then((memberships) => bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, memberships));
  },

  async updateById({ id, membership }) {
    let updatedMembership;

    if (!membership) {
      throw new MembershipUpdateError("Le membership n'est pas renseigné");
    }

    try {
      updatedMembership = await new BookshelfMembership({ id }).save(membership, {
        patch: true,
        method: 'update',
        require: true,
      });
    } catch (err) {
      throw new MembershipUpdateError(err.message);
    }

    const updatedMembershipWithUserAndOrganization = await updatedMembership.refresh({
      withRelated: ['user', 'organization'],
    });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfMembership, updatedMembershipWithUserAndOrganization);
  },

  async disableMembershipsByUserId({
    userId,
    updatedByUserId,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const knexConn = domainTransaction.knexTransaction ?? knex;
    await knexConn('memberships').where({ userId }).update({ disabledAt: new Date(), updatedByUserId });
  },
};
