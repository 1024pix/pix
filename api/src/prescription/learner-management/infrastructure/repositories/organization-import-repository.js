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

function _toJson(errors) {
  if (!errors) return null;
  const errorsWithProperties = errors.map((err) => {
    const properties = Object.getOwnPropertyNames(err);
    return properties.reduce((acc, property) => ({ ...acc, [property]: err[property] }), {});
  });
  return JSON.stringify(errorsWithProperties);
}

const save = async function (organizationImport) {
  const attributes = { ...organizationImport, errors: _toJson(organizationImport.errors) };
  if (organizationImport.id) {
    const updatedRows = await knex('organization-imports').update(attributes).where({ id: organizationImport.id });
    if (updatedRows === 0) throw new Error();
  } else {
    await knex('organization-imports').insert(attributes);
  }
};

export { save, get, getByOrganizationId };
