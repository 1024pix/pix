import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ApplicationTransaction } from '../../../shared/infrastructure/ApplicationTransaction.js';
import { IMPORT_STATUSES } from '../../domain/constants.js';
import { OrganizationImport } from '../../domain/models/OrganizationImport.js';
import { OrganizationImportDetail } from '../../domain/read-models/OrganizationImportDetail.js';

function _toDomain(data) {
  return new OrganizationImport(data);
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
  const knexConn = ApplicationTransaction.getConnection();
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
  let knexConn = DomainTransaction.getConnection();

  const attributes = { ...organizationImport, errors: _stringifyErrors(organizationImport.errors) };
  if (attributes.errors || attributes.status === IMPORT_STATUSES.UPLOADING) {
    // if there is errors, we don't want to use the given transaction
    knexConn = knex;
  }
  if (organizationImport.id) {
    const updatedRows = await knexConn('organization-imports').update(attributes).where({ id: organizationImport.id });
    if (updatedRows === 0) throw new Error();
  } else {
    await knexConn('organization-imports').insert(attributes);
  }
};

export { get, getLastByOrganizationId, getLastImportDetailForOrganization, save };
