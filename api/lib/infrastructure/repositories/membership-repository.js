const { knex } = require('../../../db/knex-database-connection');
const { MembershipCreationError, MembershipUpdateError, NotFoundError } = require('../../domain/errors');
const Membership = require('../../domain/models/Membership');
const User = require('../../domain/models/User');
const Organization = require('../../domain/models/Organization');
const Tag = require('../../domain/models/Tag');
const knexUtils = require('../utils/knex-utils');
const bluebird = require('bluebird');
const pick = require('lodash/pick');

function _setSearchFiltersForQueryBuilder(qb, filter) {
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

async function _buildMembership(membershipAttributes) {
  const userDB = await knex('users').where({ id: membershipAttributes.userId }).first();
  const organizationDB = await knex('organizations').where({ id: membershipAttributes.organizationId }).first();
  const organizationTagsDT = await knex('tags').join(
    'organization-tags',
    'organization-tags.organizationId',
    organizationDB.id
  );
  const tags = organizationTagsDT.map((attributes) => new Tag(attributes));
  const organization = new Organization({ ...organizationDB, tags });
  return new Membership({ ...membershipAttributes, user: new User(userDB), organization });
}

module.exports = {
  async create(userId, organizationId, organizationRole) {
    try {
      const rows = await knex('memberships').insert({ userId, organizationId, organizationRole }).returning('*');

      return bluebird.mapSeries(rows, _buildMembership);
    } catch (err) {
      if (knexUtils.isUniqConstraintViolated(err)) {
        throw new MembershipCreationError(err.message);
      }
      throw err;
    }
  },

  async get(id) {
    const membershipDB = await knex('memberships')
      .select(['id', 'userId', 'organizationId', 'updatedByUserId', 'organizationRole'])
      .where({ id })
      .first();
    if (!membershipDB) {
      throw new NotFoundError(`Membership ${id} not found`);
    }
    return _buildMembership(membershipDB);
  },

  async findByOrganizationId({ organizationId }) {
    const rows = await knex('memberships').where({ organizationId, disabledAt: null }).orderBy('id', 'ASC');
    return bluebird.mapSeries(rows, _buildMembership);
  },

  async findPaginatedFiltered({ organizationId, filter, page }) {
    const query = knex('memberships')
      .select('memberships.*')
      .where({ 'memberships.organizationId': organizationId, 'memberships.disabledAt': null })
      .innerJoin('users', 'memberships.userId', 'users.id')
      .orderByRaw('"organizationRole" ASC, LOWER(users."lastName") ASC, LOWER(users."firstName") ASC')
      .modify(_setSearchFiltersForQueryBuilder, filter);

    const { results, pagination } = await knexUtils.fetchPage(query, page);

    const memberships = await bluebird.mapSeries(results, _buildMembership);
    return { models: memberships, pagination };
  },

  async findByUserIdAndOrganizationId({ userId, organizationId }) {
    const rows = await knex('memberships').where({ userId, organizationId, disabledAt: null });
    return bluebird.mapSeries(rows, _buildMembership);
  },

  async findByUserId({ userId }) {
    const rows = await knex('memberships').where({ userId, disabledAt: null });
    return bluebird.mapSeries(rows, _buildMembership);
  },

  async updateById({ id, membership }) {
    const attributes = pick(membership, ['organizationRole', 'updatedByUserId', 'disabledAt']);

    const updatedRowCount = await knex('memberships')
      .update({
        ...attributes,
        updatedAt: knex.fn.now(),
      })
      .where({ id });

    if (updatedRowCount !== 1) {
      throw new MembershipUpdateError('No Rows Updated');
    }

    return this.get(id);
  },
};
