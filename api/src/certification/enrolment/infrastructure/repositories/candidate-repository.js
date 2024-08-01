import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CertificationCandidateNotFoundError } from '../../domain/errors.js';
import { Candidate } from '../../domain/models/Candidate.js';

/**
 * @function
 * @param {Candidate} params
 * @param {number} params.certificationCandidateId
 *
 * @return {Candidate}
 */
export async function get({ certificationCandidateId }) {
  const certificationCandidate = await knex('certification-candidates')
    .where({
      id: certificationCandidateId,
    })
    .first();

  return _toDomain(certificationCandidate);
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
      complementaryCertificationId: certificationCandidate.complementaryCertificationId,
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
    createdAt: candidate.createdAt,
    authorizedToStart: candidate.authorizedToStart,
    sessionId: candidate.sessionId,
    userId: candidate.userId,
    organizationLearnerId: candidate.organizationLearnerId,
    billingMode: candidate.billingMode,
    prepaymentCode: candidate.prepaymentCode,
    hasSeenCertificationInstructions: candidate.hasSeenCertificationInstructions,
  };
}
