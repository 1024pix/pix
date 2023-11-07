import { BookshelfMembership } from '../orm-models/Membership.js';
import { MembershipCreationError, MembershipUpdateError, NotFoundError } from '../../domain/errors.js';
import { Membership } from '../../domain/models/Membership.js';
import { User } from '../../domain/models/User.js';
import { Organization } from '../../domain/models/Organization.js';
import * as knexUtils from '../utils/knex-utils.js';
import * as bookshelfToDomainConverter from '../utils/bookshelf-to-domain-converter.js';
import { knex } from '../../../db/knex-database-connection.js';
import { DomainTransaction } from '../DomainTransaction.js';

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

const create = function (userId, organizationId, organizationRole) {
  return new BookshelfMembership({ userId, organizationId, organizationRole })
    .save()
    .then((bookshelfMembership) => bookshelfMembership.load(['user']))
    .then(_toDomain)
    .catch((err) => {
      if (knexUtils.isUniqConstraintViolated(err)) {
        throw new MembershipCreationError(err.message);
      }
      throw err;
    });
};

const get = async function (membershipId) {
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
};

const findByOrganizationId = async function ({ organizationId }) {
  const memberships = await BookshelfMembership.where({ organizationId, disabledAt: null })
    .orderBy('id', 'ASC')
    .fetchAll({ withRelated: ['user'] });
  return bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, memberships);
};

const findAdminsByOrganizationId = async function ({ organizationId }) {
  const membershipsDTO = await knex('memberships')
    .select([
      'memberships.id as membershipId',
      'memberships.organizationRole',
      'memberships.updatedByUserId',
      'users.id as userId',
      'users.*',
    ])
    .innerJoin('users', 'memberships.userId', 'users.id')
    .where({
      organizationId,
      disabledAt: null,
      organizationRole: Membership.roles.ADMIN,
    })
    .orderBy('memberships.id', 'ASC');

  return membershipsDTO.map((membershipDTO) => {
    const user = new User({ ...membershipDTO, id: membershipDTO.userId });
    return new Membership({ ...membershipDTO, user, id: membershipDTO.membershipId });
  });
};

const findPaginatedFiltered = async function ({ organizationId, filter, page }) {
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
};

const findByUserIdAndOrganizationId = function ({ userId, organizationId, includeOrganization = false }) {
  return BookshelfMembership.where({ userId, organizationId, disabledAt: null })
    .fetchAll({ withRelated: includeOrganization ? ['organization', 'organization.tags'] : [] })
    .then((memberships) => bookshelfToDomainConverter.buildDomainObjects(BookshelfMembership, memberships));
};

const updateById = async function ({ id, membership }) {
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
};

const disableMembershipsByUserId = async function ({
  userId,
  updatedByUserId,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction.knexTransaction ?? knex;
  await knexConn('memberships').where({ userId }).update({ disabledAt: new Date(), updatedByUserId });
};

export {
  create,
  get,
  findByOrganizationId,
  findAdminsByOrganizationId,
  findPaginatedFiltered,
  findByUserIdAndOrganizationId,
  updateById,
  disableMembershipsByUserId,
};
