// @ts-check
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { EnrolledCandidate } from '../../domain/read-models/EnrolledCandidate.js';

/**
 * @typedef {object} EnrolledCandidateQueryResult
 * @property {number} id
 * @property {number} sessionId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 */
/**

/**
 * @function
 * @param {object} params
 * @param {number} params.sessionId
 * @returns {Promise<Array<EnrolledCandidate>>}
 */
export async function findBySessionId({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  const candidatesData = await buildBaseReadQuery(knexConn).where({ 'certification-candidates.sessionId': sessionId });

  return candidatesData.map(toDomain).sort(sortAlphabeticallyByLastNameThenFirstName);
}

/**
 * @typedef {object} CandidateForComparison
 * @property {string} firstName
 * @property {string} lastName
 */

/**
 * @function
 * @param {CandidateForComparison} params
 * @param {CandidateForComparison} params
 * @returns {number}
 */
function sortAlphabeticallyByLastNameThenFirstName(
  { firstName: firstName1, lastName: lastName1 },
  { firstName: firstName2, lastName: lastName2 },
) {
  let compareRes = lastName1.localeCompare(lastName2);
  if (compareRes === 0) compareRes = firstName1.localeCompare(firstName2);
  return compareRes;
}

/**
 * @param {EnrolledCandidateQueryResult} candidateData
 * @returns {EnrolledCandidate}
 */
function toDomain(candidateData) {
  return new EnrolledCandidate({
    ...candidateData,
    hasStartedTest: Boolean(candidateData.certificationCourseId),
  });
}

/**
 * @param {import('knex').Knex} knexConn
 * @returns {import('knex').Knex.QueryBuilder}
 */
function buildBaseReadQuery(knexConn) {
  return knexConn
    .select('certification-candidates.*', 'certification-courses.id as certificationCourseId')
    .from('certification-candidates')
    .leftJoin('certification-courses', 'certification-courses.candidateId', 'certification-candidates.id')
    .groupBy('certification-candidates.id', 'certification-courses.id');
}
