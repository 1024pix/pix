import { knex } from '../../../../../db/knex-database-connection.js';

/**
 * @param {Object} params
 * @param {number} params.organizationId
 * @param {string} params.division
 * @returns {Promise<Array<number>>} candidates identifiers of active students participants to certification sessions within given division
 */
const findIdsByOrganizationIdAndDivision = function ({ organizationId, division }) {
  const uniqLastCandidatesByOrganizationLearners = knex
    .select(
      'certification-candidates.id',
      knex.raw(
        `row_number() OVER (
          PARTITION BY "certification-candidates"."organizationLearnerId"
          ORDER BY "certification-courses"."createdAt" DESC
        ) as session_number`,
      ),
    )
    .from('certification-candidates')
    .innerJoin('sessions', 'sessions.id', 'certification-candidates.sessionId')
    .innerJoin('certification-courses', (builder) => {
      builder
        .on('certification-courses.sessionId', '=', 'certification-candidates.sessionId')
        .andOn('certification-courses.userId', '=', 'certification-candidates.userId');
    })
    .innerJoin(
      { learners: 'view-active-organization-learners' },
      'learners.id',
      'certification-candidates.organizationLearnerId',
    )
    .where(_sessionHasBeenPublished)
    .where(_candidateJoinedTheSession)
    .where(_candidateIsAnActiveStudentOfTheDivision({ organizationId, division }))
    .orderBy('certification-candidates.lastName', 'ASC')
    .orderBy('certification-candidates.firstName', 'ASC')
    .as('uniqLastCandidatesByOrganizationLearners');

  return knex
    .pluck('id')
    .from(uniqLastCandidatesByOrganizationLearners)
    .where('uniqLastCandidatesByOrganizationLearners.session_number', 1);
};

const _sessionHasBeenPublished = (builder) =>
  builder.whereNotNull('sessions.publishedAt').where('certification-courses.isPublished', '=', true);

const _candidateJoinedTheSession = (builder) =>
  builder.whereNotNull('certification-candidates.userId').whereNotNull('certification-courses.id');

const _candidateIsAnActiveStudentOfTheDivision = ({ organizationId, division }) => {
  return (builder) =>
    builder
      .whereNotNull('certification-candidates.organizationLearnerId')
      .where({
        'learners.organizationId': organizationId,
        'learners.isDisabled': false,
      })
      .whereRaw('LOWER(learners.division) = ?', division.toLowerCase());
};

export { findIdsByOrganizationIdAndDivision };
