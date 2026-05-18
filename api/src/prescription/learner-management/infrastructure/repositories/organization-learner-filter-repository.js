import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { UnicityConstraintError } from '../../../../shared/domain/errors.js';
import * as knexUtils from '../../../../shared/infrastructure/utils/knex-utils.js';
import { GenericOrganizationLearnerFilter } from '../../domain/models/GenericOrganizationLearnerFilter.js';

const deleteOrganizationLearnerFiltersFromOrganizationId = async function (organizationId) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn('organization_learner_filters').where('organization_id', organizationId).del();
};

const saveOrganizationLearnerFilters = async function (organizationLearnerFilters) {
  try {
    const knexConn = DomainTransaction.getConnection();
    await knexConn.batchInsert('organization_learner_filters', organizationLearnerFilters).transacting(knexConn);
  } catch (error) {
    if (knexUtils.isUniqConstraintViolated(error) && error.code === '23505') {
      throw new UnicityConstraintError(
        'Unicity constraint failed on organization learner filter repository',
        error.detail,
      );
    }

    throw error;
  }
};

const findByOrganizationId = async function (organizationId) {
  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn('organization_learner_filters')
    .where('organization_id', organizationId)
    .select('organization_id', 'attribute_name', 'values');
  return rows.map(
    (row) =>
      new GenericOrganizationLearnerFilter({
        organizationId: row.organization_id,
        attributeName: row.attribute_name,
        values: row.values,
      }),
  );
};

export { deleteOrganizationLearnerFiltersFromOrganizationId, findByOrganizationId, saveOrganizationLearnerFilters };
