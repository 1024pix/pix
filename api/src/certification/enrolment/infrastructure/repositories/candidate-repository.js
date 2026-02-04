/**
 * @typedef {import ('../../../shared/domain/models/ComplementaryCertificationKeys.js').ComplementaryCertificationKeys} ComplementaryCertificationKeys
 */

// @ts-check
import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { SUBSCRIPTION_TYPES } from '../../../shared/domain/constants.js';
import { CertificationCandidateNotFoundError } from '../../domain/errors.js';
import { Candidate } from '../../domain/models/Candidate.js';
import { Subscription } from '../../domain/models/Subscription.js';

/**
 * @function
 * @param {object} params
 * @param {number} params.certificationCandidateId
 *
 * @returns {Promise<Candidate | null>}
 */
export async function get({ certificationCandidateId }) {
  const candidateData = await buildBaseReadQuery(knex)
    .where({ 'certification-candidates.id': certificationCandidateId })
    .first();

  if (!candidateData) return null;
  return toDomain(candidateData);
}

/**
 * @function
 * @param {object} params
 * @param {number} params.sessionId
 *
 * @returns {Promise<Array<Candidate>>}
 */
export async function findBySessionId({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();

  const candidatesData = await buildBaseReadQuery(knexConn)
    .where({ 'certification-candidates.sessionId': sessionId })
    .orderBy('certification-candidates.id');

  return candidatesData.map(toDomain);
}

/**
 * @function
 * @param {object} params
 * @param {number} params.userId
 *
 * @returns {Promise<Array<Candidate>>}
 */
export async function findByUserId({ userId }) {
  const knexTransaction = DomainTransaction.getConnection();
  const candidatesData = await buildBaseReadQuery(knexTransaction).where({ 'certification-candidates.userId': userId });
  return candidatesData.map(toDomain);
}

/**
 * @function
 * @param {Candidate} candidate
 *
 * @returns {Promise<void>}
 * @throws {CertificationCandidateNotFoundError} Certification candidate not found
 */
export async function update(candidate) {
  const candidateDataToSave = adaptModelToDb(candidate);
  const knexConn = DomainTransaction.getConnection();

  const [updatedCertificationCandidate] = await knexConn('certification-candidates')
    .where({
      id: candidate.id,
    })
    .update(candidateDataToSave)
    .returning('*');

  if (!updatedCertificationCandidate) {
    throw new CertificationCandidateNotFoundError();
  }

  await knexConn('certification-subscriptions').where({ certificationCandidateId: candidate.id }).del();

  for (const subscription of candidate.subscriptions) {
    if (subscription.type === SUBSCRIPTION_TYPES.CORE) {
      await knexConn('certification-subscriptions').insert({
        certificationCandidateId: candidate.id,
        type: subscription.type,
        complementaryCertificationId: null,
      });
    } else {
      const { id: complementaryCertificationId } = await knexConn('complementary-certifications')
        .select('id')
        .where({
          key: subscription.complementaryCertificationKey,
        })
        .first();

      await knexConn('certification-subscriptions').insert({
        certificationCandidateId: candidate.id,
        type: subscription.type,
        complementaryCertificationId: complementaryCertificationId,
      });
    }
  }
}

/**
 * @function
 * @param {Candidate} candidate
 *
 * @returns {Promise<number>}
 */
export async function insert(candidate) {
  const candidateDataToSave = adaptModelToDb(candidate);
  const knexTransaction = DomainTransaction.getConnection();

  const [{ id: candidateId }] = await knexTransaction('certification-candidates')
    .insert(candidateDataToSave)
    .returning('id');

  for (const subscription of candidate.subscriptions) {
    if (subscription.type === SUBSCRIPTION_TYPES.CORE) {
      await knexTransaction('certification-subscriptions').insert({
        certificationCandidateId: candidateId,
        type: subscription.type,
        complementaryCertificationId: null,
      });
    } else {
      const { id: complementaryCertificationId } = await knexTransaction('complementary-certifications')
        .select('id')
        .where({ key: subscription.complementaryCertificationKey })
        .first();
      await knexTransaction('certification-subscriptions').insert({
        certificationCandidateId: candidateId,
        type: subscription.type,
        complementaryCertificationId: complementaryCertificationId,
      });
    }
  }

  return candidateId;
}

/**
 * @function
 * @param {object} params
 * @param {number} params.sessionId
 * @returns {Promise<void>}
 */
export async function deleteBySessionId({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('certification-subscriptions')
    .whereIn('certificationCandidateId', knexConn.select('id').from('certification-candidates').where({ sessionId }))
    .del();

  await knexConn('certification-candidates').where({ sessionId }).del();
}

/**
 * @function
 * @param {object} params
 * @param {Candidate} params.candidate
 * @param {number} params.sessionId
 * @returns {Promise<number>} return saved candidate id
 */
export async function saveInSession({ candidate, sessionId }) {
  const candidateDataToSave = adaptModelToDb(candidate);
  const knexTransaction = DomainTransaction.getConnection();

  const [{ id: certificationCandidateId }] = await knexTransaction('certification-candidates')
    .insert({ ...candidateDataToSave, sessionId })
    .returning('id');

  for (const subscription of candidate.subscriptions) {
    if (subscription.type === SUBSCRIPTION_TYPES.CORE) {
      await knexTransaction('certification-subscriptions').insert({
        certificationCandidateId: certificationCandidateId,
        type: subscription.type,
        complementaryCertificationId: null,
      });
    } else {
      const { id: complementaryCertificationId } = await knexTransaction('complementary-certifications')
        .select('id')
        .where({ key: subscription.complementaryCertificationKey })
        .first();
      await knexTransaction('certification-subscriptions').insert({
        certificationCandidateId: certificationCandidateId,
        type: subscription.type,
        complementaryCertificationId: complementaryCertificationId,
      });
    }
  }

  return certificationCandidateId;
}

/**
 * @function
 * @param {object} params
 * @param {number} params.id
 * @returns {Promise<boolean>}
 */
export async function remove({ id }) {
  await knex.transaction(async (trx) => {
    await trx('certification-subscriptions').where({ certificationCandidateId: id }).del();
    return trx('certification-candidates').where({ id }).del();
  });

  return true;
}

/**
 * @param {import('knex').Knex} knexConnection
 * @returns {import('knex').Knex.QueryBuilder}
 */
function buildBaseReadQuery(knexConnection) {
  return knexConnection('certification-candidates')
    .select('certification-candidates.*')
    .select({
      subscriptions: knex.raw(
        `json_agg(
          json_build_object(
            'type', "certification-subscriptions"."type",
            'complementaryCertificationKey', "complementary-certifications"."key",
            'certificationCandidateId', "certification-candidates"."id"
          ) ORDER BY type
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

/**
 * @typedef {object} CandidateDBModel
 * @property {number} userId
 * @property {number} sessionId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {Date} birthdate
 * @property {string} sex
 * @property {string} birthCity
 * @property {string} birthProvinceCode
 * @property {string} birthCountry
 * @property {number} birthPostalCode
 * @property {number} birthINSEECode
 * @property {string} externalId
 * @property {string} resultRecipientEmail
 * @property {string} billingMode
 * @property {string} prepaymentCode
 * @property {number} organizationLearnerId
 * @property {boolean} authorizedToStart
 * @property {boolean} hasSeenCertificationInstructions
 * @property {boolean} accessibilityAdjustmentNeeded
 * @property {number | null} extraTimePercentage
 * @property {Date} reconciledAt
 }
 */

/**
 * @function
 * @param {Candidate} candidate
 * @returns {CandidateDBModel}
 */
function adaptModelToDb(candidate) {
  return {
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    sex: candidate.sex,
    birthPostalCode: candidate.birthPostalCode,
    birthINSEECode: candidate.birthINSEECode,
    birthCity: candidate.birthCity,
    birthProvinceCode: candidate.birthProvinceCode,
    birthCountry: candidate.birthCountry,
    email: candidate.email,
    resultRecipientEmail: candidate.resultRecipientEmail,
    externalId: candidate.externalId,
    birthdate: candidate.birthdate,
    extraTimePercentage: candidate.extraTimePercentage,
    authorizedToStart: candidate.authorizedToStart,
    sessionId: candidate.sessionId,
    userId: candidate.userId,
    reconciledAt: candidate.reconciledAt,
    organizationLearnerId: candidate.organizationLearnerId,
    billingMode: candidate.billingMode,
    prepaymentCode: candidate.prepaymentCode,
    hasSeenCertificationInstructions: candidate.hasSeenCertificationInstructions,
    accessibilityAdjustmentNeeded: candidate.accessibilityAdjustmentNeeded,
  };
}

/**
 * @typedef {object} CandidateDTO
 * @property {number} id
 * @property {number} userId
 * @property {number} sessionId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {Date} birthdate
 * @property {string} sex
 * @property {string} birthCity
 * @property {string} birthProvinceCode
 * @property {string} birthCountry
 * @property {number} birthPostalCode
 * @property {number} birthINSEECode
 * @property {string} externalId
 * @property {string} resultRecipientEmail
 * @property {string} billingMode
 * @property {string} prepaymentCode
 * @property {number} organizationLearnerId
 * @property {boolean} authorizedToStart
 * @property {boolean} hasSeenCertificationInstructions
 * @property {boolean} accessibilityAdjustmentNeeded
 * @property {number | null} extraTimePercentage
 * @property {Array<SubscriptionDTO>} subscriptions
 * @property {Date} reconciledAt
 * @property {Date} createdAt
 */

/**
 * @typedef {object} SubscriptionDTO
 * @property {string} type
 * @property {ComplementaryCertificationKeys} complementaryCertificationKey
 * @property {number} certificationCandidateId
 */

/**
 * @function
 * @param {CandidateDTO} candidateData
 * @returns {Candidate}
 */
function toDomain(candidateData) {
  const subscriptions = candidateData.subscriptions.map((subscription) => new Subscription(subscription));
  return new Candidate({
    ...candidateData,
    subscriptions,
  });
}
