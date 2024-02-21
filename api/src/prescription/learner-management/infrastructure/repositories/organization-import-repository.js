import { knex } from '../../../../../db/knex-database-connection.js';
import { OrganizationImport } from '../../domain/models/OrganizationImport.js';

function _toDomain(data) {
  return new OrganizationImport(data);
}

const getByOrganizationId = async function (organizationId) {
  const result = await knex('organization-imports').where({ organizationId }).orderBy('createdAt', 'desc').first();

  if (!result) return null;

  return _toDomain(result);
};

const get = async function (id) {
  const result = await knex('organization-imports').where({ id }).first();

  if (!result) return null;

  return _toDomain(result);
};

const save = async function (organizationImport) {
  if (organizationImport.id) {
    const updatedRows = await knex('organization-imports')
      .update(organizationImport)
      .where({ id: organizationImport.id });
    if (updatedRows === 0) throw new Error();
  } else {
    await knex('organization-imports').insert(organizationImport);
  }
};

export { save, get, getByOrganizationId };
