const OrganizationMemberIdentity = require('../../domain/models/OrganizationMemberIdentity.js');
const { knex } = require('../../../db/knex-database-connection.js');

module.exports = {
  async findAllByOrganizationId({ organizationId }) {
    const sortedMembers = await knex('users')
      .select('users.id', 'users.firstName', 'users.lastName')
      .join('memberships', 'memberships.userId', 'users.id')
      .where({ disabledAt: null, organizationId })
      .orderByRaw('LOWER("firstName") asc')
      .orderByRaw('LOWER("lastName") asc');

    return sortedMembers.map((sortedMember) => new OrganizationMemberIdentity({ ...sortedMember }));
  },
};
