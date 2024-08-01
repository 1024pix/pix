import { knex } from '../../../../../db/knex-database-connection.js';
import { CertificationCandidateNotFoundError } from '../../domain/errors.js';
import { Candidate } from '../../domain/models/Candidate.js';

/**
 * @function
 * @param {Candidate} params
 * @param {number} params.certificationCandidateId
 *
 * @return {Candidate}
 */
const get = async function ({ certificationCandidateId }) {
  const certificationCandidate = await knex('certification-candidates')
    .where({
      id: certificationCandidateId,
    })
    .first();

  return _toDomain(certificationCandidate);
};

/**
 * @function
 * @param {Object} certificationCandidate
 *
 * @return {Candidate}
 * @throws {CertificationCandidateNotFoundError} Certification candidate not found
 */
const update = async function (certificationCandidate) {
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
};

/**
 * @function
 * @param {Object} params
 * @param {number} params.certificationCandidateId
 * @param {number} params.userId
 *
 * @return {Boolean} Returns true if candidate is found or false otherwise
 */
const isUserCertificationCandidate = async function ({ certificationCandidateId, userId }) {
  const certificationCandidate = await knex
    .select(1)
    .from('certification-candidates')
    .where({
      id: certificationCandidateId,
      userId,
    })
    .first();

  return Boolean(certificationCandidate);
};

export { get, isUserCertificationCandidate, update };

function _toDomain(result) {
  return result ? new Candidate(result) : null;
}
