import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { DeletedError, NotFoundError } from '../../../../shared/domain/errors.js';
import { OrganizationPlacesLotManagement } from '../../domain/read-models/OrganizationPlacesLotManagement.js';
import { PlacesLot } from '../../domain/read-models/PlacesLot.js';

const findByOrganizationIdWithJoinedUsers = async (organizationId) => {
  const extraColumns = [
    'users.firstName AS creatorFirstName',
    'users.lastName AS creatorLastName',
    'organization-places.reference',
    'organization-places.category',
  ];

  const results = await baseQuery({ organizationIds: [organizationId], callOrderByAndRemoveDeleted: true })
    .select(...extraColumns)
    .join('users', 'users.id', 'organization-places.createdBy');

  return results.map((result) => {
    return new OrganizationPlacesLotManagement(result);
  });
};

const baseQuery = ({ organizationIds, callOrderByAndRemoveDeleted = false }) => {
  const knexConn = DomainTransaction.getConnection();

  let query = knexConn('organization-places')
    .select(
      'organization-places.id',
      'organization-places.count',
      'organization-places.organizationId',
      'organization-places.activationDate',
      'organization-places.expirationDate',
      'organization-places.deletedAt',
    )
    .whereIn('organization-places.organizationId', organizationIds);

  if (callOrderByAndRemoveDeleted) {
    query = orderByAndRemoveDeleted(query);
  }

  return query;
};

const findAllByOrganizationIds = async ({ organizationIds, callOrderByAndRemoveDeleted = false }) => {
  const placesLots = await baseQuery({ organizationIds, callOrderByAndRemoveDeleted });
  return placesLots.map((placesLot) => new PlacesLot(placesLot));
};

const orderByAndRemoveDeleted = (query) => {
  return query
    .whereNull('organization-places.deletedAt')
    .orderBy(
      knex.raw(
        'CASE WHEN "organization-places"."activationDate" <= now() AND "organization-places"."expirationDate" >= now() THEN 1 WHEN "organization-places"."activationDate" > now() THEN 2 ELSE 3 END',
      ),
      'asc',
    )
    .orderBy('organization-places.expirationDate', 'desc')
    .orderBy('organization-places.activationDate', 'desc')
    .orderBy('organization-places.createdAt', 'desc');
};

const get = async function (id) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('organization-places')
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
  const knexConn = DomainTransaction.getConnection();
  const [{ id }] = await knexConn('organization-places').insert(places).returning('id');
  return id;
};

const remove = async function ({ id, deletedBy }) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('organization-places')
    .update({ deletedAt: new Date(), deletedBy })
    .where({ id, deletedBy: null });

  if (!result) {
    throw new DeletedError('Organization places lot already deleted');
  }
};

export { create, findAllByOrganizationIds, findByOrganizationIdWithJoinedUsers, get, remove };
