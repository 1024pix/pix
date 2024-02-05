import { knex } from '../../../../../db/knex-database-connection.js';

/**
 * @returns {Array<number>} certification candidates ids
 */
const findIdsByOrganizationIdAndDivision = async function ({ organizationId, division }) {
  return knex
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
    .orderBy('certification-candidates.firstName', 'ASC')
    .pluck('certification-candidates.id');
};

export { findIdsByOrganizationIdAndDivision };
