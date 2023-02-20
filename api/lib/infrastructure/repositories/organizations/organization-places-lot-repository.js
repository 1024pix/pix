import { knex } from '../../../../db/knex-database-connection';
import OrganizationPlacesLotManagement from '../../../domain/read-models/OrganizationPlacesLotManagement';
import { NotFoundError, DeletedError } from '../../../domain/errors';

export default {
  async findByOrganizationId(organizationId) {
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
  },

  async get(id) {
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
  },

  async create(places) {
    const [{ id }] = await knex('organization-places').insert(places).returning('id');
    return id;
  },

  async delete({ id, deletedBy }) {
    const result = await knex('organization-places')
      .update({ deletedAt: new Date(), deletedBy })
      .where({ id, deletedBy: null });

    if (!result) {
      throw new DeletedError('Organization places lot already deleted');
    }
  },
};
