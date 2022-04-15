const { knex } = require('../../../../db/knex-database-connection');
const OrganizationPlace = require('../../../domain/read-models/OrganizationPlace');

async function find(organizationId) {
  const results = await knex('organization-places')
    .select(
      'organization-places.id AS id',
      'count',
      'activationDate',
      'expiredDate',
      'reference',
      'category',
      'users.firstName AS creatorFirstName',
      'users.lastName AS creatorLastName'
    )
    .join('users', 'users.id', 'createdBy')
    .where({ organizationId })
    .orderBy('activationDate', 'desc')
    .orderBy('expiredDate', 'desc')
    .orderBy('organization-places.createdAt', 'desc');

  return results.map((result) => {
    return new OrganizationPlace(result);
  });
}

module.exports = {
  find,
};
