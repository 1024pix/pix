import { ORGANIZATION_FEATURE } from '../../../../shared/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { OrganizationLearnerImportFormat } from '../../domain/models/OrganizationLearnerImportFormat.js';

function _toDomain(data) {
  return new OrganizationLearnerImportFormat(data);
}

const get = async function (organizationId) {
  const knex = DomainTransaction.getConnection();
  const configResult = await knex('organization-features')
    .select('params')
    .join('features', function () {
      this.on('features.id', 'organization-features.featureId').onVal(
        'features.key',
        ORGANIZATION_FEATURE.LEARNER_IMPORT.key,
      );
    })
    .where({ organizationId })
    .first();

  if (!configResult) return null;

  const result = await knex('organization-learner-import-formats')
    .where('id', configResult.params.organizationLearnerImportFormatId)
    .first();

  if (!result) return null;

  return _toDomain(result);
};

const findAll = async function () {
  const knex = DomainTransaction.getConnection();
  const results = await knex('organization-learner-import-formats');
  return results.map(_toDomain);
};

/**
 * @type {function}
 * @param {Object} params
 * @param {Array|Object} params.organizationLearnerImportFormats
 * @return {Promise<void>}
 */
const save = async function ({ organizationLearnerImportFormats }) {
  const knexConn = DomainTransaction.getConnection();
  const updatedAt = new Date();

  for (const organizationLearnerImport of organizationLearnerImportFormats) {
    await knexConn('organization-learner-import-formats')
      .insert({ ...organizationLearnerImport, updatedAt })
      .onConflict('name')
      .merge(['config', 'fileType', 'updatedAt']);
  }
};

export { findAll, get, save };
