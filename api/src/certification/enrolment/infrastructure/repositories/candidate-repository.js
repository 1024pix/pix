import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationCandidateNotFoundError } from '../../domain/errors.js';
import { Candidate } from '../../domain/models/Candidate.js';
import { Subscription } from '../../domain/models/Subscription.js';

/**
 * @function
 * @param {Candidate} params
 * @param {number} params.certificationCandidateId
 *
 * @return {Candidate}
 */
export async function get({ certificationCandidateId }) {
  const candidateData = await knex
    .select('certification-candidates.*')
    .select({
      subscriptions: knex.raw(
        `json_agg(
          json_build_object(
            'type', "certification-subscriptions"."type",
            'complementaryCertificationId', "certification-subscriptions"."complementaryCertificationId",
            'certificationCandidateId', "certification-candidates"."id"
          ) ORDER BY type
      )`,
      ),
    })
    .from('certification-candidates')
    .where({ 'certification-candidates.id': certificationCandidateId })
    .join(
      'certification-subscriptions',
      'certification-subscriptions.certificationCandidateId',
      'certification-candidates.id',
    )
    .groupBy('certification-candidates.id')
    .first();
  if (!candidateData) return null;

  const subscriptions = candidateData.subscriptions.map((subscription) => new Subscription(subscription));
  return new Candidate({
    ...candidateData,
    subscriptions,
  });
}

/**
 * @function
 * @param {Object} certificationCandidate
 *
 * @return {Candidate}
 * @throws {CertificationCandidateNotFoundError} Certification candidate not found
 */
export async function update(certificationCandidate) {
  const [updatedCertificationCandidate] = await knex('certification-candidates')
    .where({
      id: certificationCandidate.id,
    })
    .update({
      id: certificationCandidate.id,
      firstName: certificationCandidate.firstName,
      lastName: certificationCandidate.lastName,
      sex: certificationCandidate.sex,
      birthPostalCode: certificationCandidate.birthPostalCode,
      birthINSEECode: certificationCandidate.birthINSEECode,
      birthCity: certificationCandidate.birthCity,
      birthProvinceCode: certificationCandidate.birthProvinceCode,
      birthCountry: certificationCandidate.birthCountry,
      email: certificationCandidate.email,
      resultRecipientEmail: certificationCandidate.resultRecipientEmail,
      externalId: certificationCandidate.externalId,
      birthdate: certificationCandidate.birthdate,
      extraTimePercentage: certificationCandidate.extraTimePercentage,
      createdAt: certificationCandidate.createdAt,
      authorizedToStart: certificationCandidate.authorizedToStart,
      sessionId: certificationCandidate.sessionId,
      userId: certificationCandidate.userId,
      organizationLearnerId: certificationCandidate.organizationLearnerId,
      billingMode: certificationCandidate.billingMode,
      prepaymentCode: certificationCandidate.prepaymentCode,
      hasSeenCertificationInstructions: certificationCandidate.hasSeenCertificationInstructions,
    })
    .returning('*');

  if (!updatedCertificationCandidate) {
    throw new CertificationCandidateNotFoundError();
  }

  return _toDomain(updatedCertificationCandidate);
}

/**
 * @function
 * @param {Object} params
 * @param {number} params.certificationCandidateId
 * @param {number} params.userId
 *
 * @return {Boolean} Returns true if candidate is found or false otherwise
 */
export async function isUserCertificationCandidate({ certificationCandidateId, userId }) {
  const certificationCandidate = await knex
    .select(1)
    .from('certification-candidates')
    .where({
      id: certificationCandidateId,
      userId,
    })
    .first();

  return Boolean(certificationCandidate);
}

/**
 * @function
 * @param sessionId
 * @returns {boolean} True if any candidate is linked to an existing user
 */
export async function doesLinkedCertificationCandidateInSessionExist({ sessionId }) {
  const anyLinkedCandidateInSession = await knex
    .select('id')
    .from('certification-candidates')
    .where({
      sessionId,
    })
    .whereNotNull('userId');

  return anyLinkedCandidateInSession.length > 0;
}

/**
 * @function
 * @param {Object} candidate
 *
 * @return {number}
 */
export async function insert(candidate) {
  const candidateDataToSave = _adaptModelToDb(candidate);
  const knexTransaction = DomainTransaction.getConnection();

  const [{ id: candidateId }] = await knexTransaction('certification-candidates')
    .insert(candidateDataToSave)
    .returning('id');

  for (const subscription of candidate.subscriptions) {
    await knexTransaction('certification-subscriptions').insert({
      certificationCandidateId: candidateId,
      type: subscription.type,
      complementaryCertificationId: subscription.complementaryCertificationId,
    });
  }

  return candidateId;
}

/**
 * @function
 * @param sessionId
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
 * @param candidate
 * @param sessionId
 * @returns {number} return saved candidate id
 */
export async function saveInSession({ candidate, sessionId }) {
  const candidateDataToSave = _adaptModelToDb(candidate);
  const knexTransaction = DomainTransaction.getConnection();

  const [{ id: certificationCandidateId }] = await knexTransaction('certification-candidates')
    .insert({ ...candidateDataToSave, sessionId })
    .returning('id');

  for (const subscription of candidate.subscriptions) {
    await knexTransaction('certification-subscriptions').insert({
      certificationCandidateId,
      type: subscription.type,
      complementaryCertificationId: subscription.complementaryCertificationId,
    });
  }

  return certificationCandidateId;
}

/**
 * @function
 * @param id
 * @returns {boolean}
 */
export async function remove({ id }) {
  await knex.transaction(async (trx) => {
    await trx('certification-subscriptions').where({ certificationCandidateId: id }).del();
    return trx('certification-candidates').where({ id }).del();
  });

  return true;
}

function _toDomain(result) {
  return result ? new Candidate(result) : null;
}

function _adaptModelToDb(candidate) {
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
    organizationLearnerId: candidate.organizationLearnerId,
    billingMode: candidate.billingMode,
    prepaymentCode: candidate.prepaymentCode,
    hasSeenCertificationInstructions: candidate.hasSeenCertificationInstructions,
  };
}
