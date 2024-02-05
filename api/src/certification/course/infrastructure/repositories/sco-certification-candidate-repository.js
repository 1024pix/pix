import { knex } from '../../../../../db/knex-database-connection.js';

const findIdsByOrganizationIdAndDivision = async function ({ organizationId, division }) {
  const rows = await knex
    .select(['certification-candidates.id'])
    .from('certification-candidates')
    .join(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'certification-candidates.organizationLearnerId',
    )
    .where({
      'view-active-organization-learners.organizationId': organizationId,
      'view-active-organization-learners.isDisabled': false,
    })
    .whereRaw('LOWER("view-active-organization-learners"."division") = ?', division.toLowerCase())
    .orderBy('certification-candidates.lastName', 'ASC')
    .orderBy('certification-candidates.firstName', 'ASC');

  return rows.map((row) => row.id);
};

export { findIdsByOrganizationIdAndDivision };
