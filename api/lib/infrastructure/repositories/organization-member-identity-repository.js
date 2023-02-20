import OrganizationMemberIdentity from '../../domain/models/OrganizationMemberIdentity';
import { knex } from '../../../db/knex-database-connection';

export default {
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
