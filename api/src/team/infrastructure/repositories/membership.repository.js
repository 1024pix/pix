import { User } from '../../../identity-access-management/domain/models/User.js';
import { Organization } from '../../../organizational-entities/domain/models/Organization.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { MembershipCreationError, MembershipUpdateError, NotFoundError } from '../../../shared/domain/errors.js';
import { Membership } from '../../../shared/domain/models/Membership.js';
import * as knexUtils from '../../../shared/infrastructure/utils/knex-utils.js';
import { fetchPage } from '../../../shared/infrastructure/utils/knex-utils.js';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_NUMBER = 1;

const ORGANIZATION_TAGS_TABLE = 'organization-tags';
const ORGANIZATIONS_TABLE = 'organizations';
const MEMBERSHIPS_TABLE = 'memberships';
const USERS_TABLE = 'users';

export const create = async (userId, organizationId, organizationRole) => {
  const knexConnection = DomainTransaction.getConnection();
  try {
    const [{ id: membershipId }] = await knexConnection(MEMBERSHIPS_TABLE)
      .insert({ userId, organizationId, organizationRole })
      .returning('id');

    const membership = await knexConnection(MEMBERSHIPS_TABLE).where({ id: membershipId }).first();
    const user = await knexConnection(USERS_TABLE).where({ id: membership.userId }).first();

    return toDomain(membership, user);
  } catch (error) {
    if (knexUtils.isUniqConstraintViolated(error)) {
      throw new MembershipCreationError(error.message);
    }
    throw error;
  }
};

export const get = async function (membershipId) {
  const knexConnection = DomainTransaction.getConnection();

  const membership = await knexConnection(MEMBERSHIPS_TABLE).where({ id: membershipId }).first();
  if (!membership) {
    throw new NotFoundError(`Membership ${membershipId} not found`);
  }

  const user = await knexConnection(USERS_TABLE).where({ id: membership.userId }).first();
  const organisation = await knexConnection(ORGANIZATIONS_TABLE).where({ id: membership.organizationId }).first();

  return toDomain(membership, user, organisation);
};

export const findByOrganizationId = async function ({ organizationId }) {
  const knexConnection = DomainTransaction.getConnection();

  const memberships = await knexConnection(MEMBERSHIPS_TABLE)
    .where({ organizationId, disabledAt: null })
    .orderBy('id', 'ASC');

  const membershipUserIds = memberships.map(({ userId }) => userId);
  const users = await knexConnection(USERS_TABLE).whereIn('id', membershipUserIds);

  return memberships.map((membership) => {
    const user = users.find(({ id }) => id === membership.userId);
    return toDomain(membership, user);
  });
};

export const findAdminsByOrganizationId = async function ({ organizationId }) {
  const knexConnection = DomainTransaction.getConnection();

  const memberships = await knexConnection(MEMBERSHIPS_TABLE)
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

  return memberships.map((membership) => {
    const userData = { ...membership, id: membership.userId };
    const membershipData = { ...membership, user: userData, id: membership.membershipId };
    return toDomain(membershipData, userData);
  });
};

export const findPaginatedFiltered = async function ({ organizationId, filter, page }) {
  const knexConnection = DomainTransaction.getConnection();

  const pageSize = page.size ? page.size : DEFAULT_PAGE_SIZE;
  const pageNumber = page.number ? page.number : DEFAULT_PAGE_NUMBER;

  const queryBuilder = knexConnection(MEMBERSHIPS_TABLE).select('memberships.id as membershipId', '*');
  queryBuilder.where({
    'memberships.organizationId': organizationId,
    'memberships.disabledAt': null,
  });
  setSearchFiltersForQueryBuilder(filter, queryBuilder);
  queryBuilder.innerJoin('users', 'memberships.userId', 'users.id');
  queryBuilder.orderByRaw('"organizationRole" ASC, LOWER(users."lastName") ASC, LOWER(users."firstName") ASC');

  const result = await fetchPage(queryBuilder, { number: pageNumber, size: pageSize });
  const memberships = result.results.map(
    (membership) =>
      new Membership({
        id: membership.membershipId,
        organizationRole: membership.organizationRole,
        updatedByUserId: membership.updatedByUserId,
        user: new User(membership),
      }),
  );

  return { models: memberships, pagination: result.pagination };
};

export const findByUserIdAndOrganizationId = async ({ userId, organizationId, includeOrganization = false }) => {
  const knexConnection = DomainTransaction.getConnection();
  const memberships = await knexConnection(MEMBERSHIPS_TABLE).where({ userId, organizationId, disabledAt: null });

  if (!includeOrganization) {
    return memberships.map(toDomain);
  }
  const membershipOrganizationIds = memberships.map(({ organizationId }) => organizationId);
  const organizations = await knexConnection(ORGANIZATIONS_TABLE).whereIn('id', membershipOrganizationIds);
  const organizationIds = organizations.map(({ id }) => id);
  const organizationsTags = await knexConnection(ORGANIZATION_TAGS_TABLE).whereIn('organizationId', organizationIds);

  return memberships.map((membership) => {
    const organization = organizations.find(({ id }) => id === membership.organizationId);
    const organizationTags = organizationsTags.filter(({ organizationId }) => organizationId === organization.id);
    return toDomain(membership, null, organization, organizationTags);
  });
};

export const updateById = async ({ id, membership }) => {
  const knexConnection = DomainTransaction.getConnection();

  if (!membership) {
    throw new MembershipUpdateError("Le membership n'est pas renseigné");
  }
  if (!(await knexConnection(MEMBERSHIPS_TABLE).select('id').where({ id }).first())) {
    throw new MembershipUpdateError();
  }

  await knexConnection(MEMBERSHIPS_TABLE)
    .where({ id })
    .update({
      ...membership,
      updatedAt: new Date(),
    });

  return get(id);
};

export const disableMembershipsByUserId = async function ({ userId, updatedByUserId }) {
  const knexConnection = DomainTransaction.getConnection();
  await knexConnection(MEMBERSHIPS_TABLE)
    .where({ userId })
    .update({ disabledAt: new Date(), updatedAt: new Date(), updatedByUserId });
};

const toDomain = (membershipData, userData = null, organizationData = null, organizationTags = null) => {
  const membership = new Membership(membershipData);
  if (userData) membership.user = new User(userData);
  if (organizationData) membership.organization = new Organization(organizationData);
  if (organizationTags) membership.organization.tags = organizationTags;
  return membership;
};

const setSearchFiltersForQueryBuilder = (filter, queryBuilder) => {
  const { firstName, lastName, email, organizationRole } = filter;
  if (firstName) {
    queryBuilder.whereILike('users.firstName', `%${firstName}%`);
  }
  if (lastName) {
    queryBuilder.whereILike('users.lastName', `%${lastName}%`);
  }
  if (email) {
    queryBuilder.whereILike('users.email', `%${email}%`);
  }
  if (organizationRole) {
    queryBuilder.where('memberships.organizationRole', organizationRole);
  }
};
