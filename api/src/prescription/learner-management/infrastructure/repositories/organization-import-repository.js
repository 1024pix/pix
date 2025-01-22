import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { OrganizationImportStatus } from '../../domain/models/OrganizationImportStatus.js';
import { OrganizationImportDetail } from '../../domain/read-models/OrganizationImportDetail.js';

function _toDomain(data) {
  return new OrganizationImportStatus(data);
}

const getLastByOrganizationId = async function (organizationId) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('organization-imports').where({ organizationId }).orderBy('createdAt', 'desc').first();

  if (!result) return null;

  return _toDomain(result);
};

const getLastImportDetailForOrganization = async function (organizationId) {
  const result = await knex('organization-imports')
    .select('organization-imports.*', 'users.firstName', 'users.lastName')
    .join('users', 'users.id', 'organization-imports.createdBy')
    .where({ organizationId })
    .orderBy('createdAt', 'desc')
    .first();

  if (!result) return null;

  return new OrganizationImportDetail(result);
};

const get = async function (id) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('organization-imports').where({ id }).first();

  if (!result) return null;

  return _toDomain(result);
};

function _stringifyErrors(errors) {
  if (!errors) return null;
  const errorsWithProperties = errors.map((err) => {
    const properties = Object.getOwnPropertyNames(err);
    return properties.reduce((acc, property) => ({ ...acc, [property]: err[property] }), {});
  });
  return JSON.stringify(errorsWithProperties);
}

const save = async function (organizationImport) {
  const attributes = { ...organizationImport, errors: _stringifyErrors(organizationImport.errors) };

  if (organizationImport.id) {
    const updatedRows = await knex('organization-imports').update(attributes).where({ id: organizationImport.id });
    if (updatedRows === 0) throw new Error();
  } else {
    await knex('organization-imports').insert(attributes);
  }
};

export { get, getLastByOrganizationId, getLastImportDetailForOrganization, save };
