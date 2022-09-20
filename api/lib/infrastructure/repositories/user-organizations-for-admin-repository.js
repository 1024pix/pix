const { knex } = require('../../../db/knex-database-connection');
const UserOrganizationForAdmin = require('../../domain/read-models/UserOrganizationForAdmin');

module.exports = {
  async findByUserId(userId) {
    const organizations = await knex('memberships')
      .select({
        id: 'memberships.id',
        updatedAt: 'memberships.updatedAt',
        role: 'memberships.organizationRole',
        organizationId: 'memberships.organizationId',
        organizationName: 'organizations.name',
        organizationType: 'organizations.type',
        organizationExternalId: 'organizations.externalId',
      })
      .innerJoin('organizations', 'organizations.id', 'memberships.organizationId')
      .where('memberships.userId', userId)
      .whereNull('memberships.disabledAt');

    return organizations.map((attributes) => new UserOrganizationForAdmin(attributes));
  },
};
