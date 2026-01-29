// @ts-check
import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Subscription } from '../../domain/models/Subscription.js';
import { EnrolledCandidate } from '../../domain/read-models/EnrolledCandidate.js';

/**
 * @typedef {object} EnrolledCandidateQueryResult
 * @property {number} id
 * @property {number} sessionId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {Array<object>} subscriptions
 * @property {string} subscriptions.type
 * @property {string} subscriptions.complementaryCertificationKey
 * @property {number} subscriptions.certificationCandidateId
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
  const subscriptions = candidateData.subscriptions.map((subscription) => new Subscription(subscription));
  return new EnrolledCandidate({
    ...candidateData,
    subscriptions,
  });
}

/**
 * @param {import('knex').Knex} knexConnection
 * @returns {import('knex').Knex.QueryBuilder}
 */
function buildBaseReadQuery(knexConnection) {
  return knexConnection
    .select('certification-candidates.*')
    .select({
      subscriptions: knex.raw(
        `json_agg(
          json_build_object(
            'type', "certification-subscriptions"."type",
            'complementaryCertificationKey', "complementary-certifications"."key",
            'certificationCandidateId', "certification-candidates"."id"
          )
      )`,
      ),
    })
    .from('certification-candidates')
    .join(
      'certification-subscriptions',
      'certification-subscriptions.certificationCandidateId',
      'certification-candidates.id',
    )
    .leftJoin(
      'complementary-certifications',
      'certification-subscriptions.complementaryCertificationId',
      'complementary-certifications.id',
    )
    .groupBy('certification-candidates.id');
}
