import { ORGANIZATION_FEATURE } from '../../../../shared/domain/constants.js';
import { ApplicationTransaction } from '../../../shared/infrastructure/ApplicationTransaction.js';
import { OrganizationLearnerImportFormat } from '../../domain/models/OrganizationLearnerImportFormat.js';

function _toDomain(data) {
  return new OrganizationLearnerImportFormat(data);
}

const get = async function (organizationId) {
  const knex = ApplicationTransaction.getConnection();

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

export { get };
