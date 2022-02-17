const OrganizationMember = require('../../domain/models/OrganizationMember');
const { knex } = require('../../../db/knex-database-connection');

module.exports = {
  async getAllByOrganizationId({ organizationId }) {
    const membersDTO = await knex('users')
      .select('users.id', 'users.firstName', 'users.lastName')
      .join('memberships', 'memberships.userId', 'users.id')
      .where({ disabledAt: null, organizationId })
      .orderBy('lastName', 'ASC')
      .orderBy('firstName', 'ASC');

    return membersDTO.map((memberDTO) => new OrganizationMember({ ...memberDTO }));
  },
};
