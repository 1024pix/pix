const { knex } = require('../../../../db/knex-database-connection');
const OrganizationPlacesLotManagement = require('../../../domain/read-models/OrganizationPlacesLotManagement');
const { NotFoundError } = require('../../../domain/errors');

async function findByOrganizationId(organizationId) {
  const results = await knex('organization-places')
    .select(
      'organization-places.id AS id',
      'count',
      'activationDate',
      'expirationDate',
      'reference',
      'category',
      'users.firstName AS creatorFirstName',
      'users.lastName AS creatorLastName'
    )
    .join('users', 'users.id', 'createdBy')
    .where({ organizationId })
    .whereNull('deletedAt')
    .orderBy('activationDate', 'desc')
    .orderBy('expirationDate', 'desc')
    .orderBy('organization-places.createdAt', 'desc');

  return results.map((result) => {
    return new OrganizationPlacesLotManagement(result);
  });
}

async function get(id) {
  const result = await knex('organization-places')
    .select(
      'organization-places.id AS id',
      'count',
      'activationDate',
      'expirationDate',
      'reference',
      'category',
      'users.firstName AS creatorFirstName',
      'users.lastName AS creatorLastName'
    )
    .join('users', 'users.id', 'createdBy')
    .where({ 'organization-places.id': id })
    .first();

  if (!result) {
    throw new NotFoundError();
  }

  return new OrganizationPlacesLotManagement(result);
}

async function create(places) {
  const [{ id }] = await knex('organization-places').insert(places).returning('id');
  return id;
}

module.exports = {
  findByOrganizationId,
  get,
  create,
};
