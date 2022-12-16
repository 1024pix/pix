const { knex } = require('../../../db/knex-database-connection');
const OrganizationPlacesCapacity = require('../../domain/read-models/OrganizationPlacesCapacity');

async function findByOrganizationId(organizationId) {
  const now = new Date();
  const organizationPlacesLots = await knex('organization-places')
    .select('category', 'count')
    .where({ organizationId })
    .where('activationDate', '<', now)
    .whereNull('deletedAt')
    .where(function () {
      this.where('expirationDate', '>', now).orWhereNull('expirationDate');
    });

  return new OrganizationPlacesCapacity({ placesLots: organizationPlacesLots, organizationId });
}

module.exports = {
  findByOrganizationId,
};
