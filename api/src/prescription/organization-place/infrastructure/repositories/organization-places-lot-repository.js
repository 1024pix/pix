import { knex } from '../../../../../db/knex-database-connection.js';
import { OrganizationPlacesLotManagement } from '../../domain/read-models/OrganizationPlacesLotManagement.js';
import { NotFoundError, DeletedError } from '../../../../../lib/domain/errors.js';

const findByOrganizationId = async function (organizationId) {
  const results = await knex('organization-places')
    .select(
      'organization-places.id AS id',
      'count',
      'activationDate',
      'expirationDate',
      'reference',
      'category',
      'users.firstName AS creatorFirstName',
      'users.lastName AS creatorLastName',
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
};

const get = async function (id) {
  const result = await knex('organization-places')
    .select(
      'organization-places.id AS id',
      'count',
      'activationDate',
      'expirationDate',
      'reference',
      'category',
      'users.firstName AS creatorFirstName',
      'users.lastName AS creatorLastName',
    )
    .join('users', 'users.id', 'createdBy')
    .where({ 'organization-places.id': id })
    .first();

  if (!result) {
    throw new NotFoundError();
  }

  return new OrganizationPlacesLotManagement(result);
};

const create = async function (places) {
  const [{ id }] = await knex('organization-places').insert(places).returning('id');
  return id;
};

const remove = async function ({ id, deletedBy }) {
  const result = await knex('organization-places')
    .update({ deletedAt: new Date(), deletedBy })
    .where({ id, deletedBy: null });

  if (!result) {
    throw new DeletedError('Organization places lot already deleted');
  }
};

export { findByOrganizationId, get, create, remove };
