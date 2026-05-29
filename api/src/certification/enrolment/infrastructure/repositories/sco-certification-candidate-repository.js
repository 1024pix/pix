// @ts-check
/**
 * @typedef {import ('../../domain/models/SCOCertificationCandidate.js').SCOCertificationCandidate} SCOCertificationCandidate
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { SUBSCRIPTION_TYPES } from '../../../shared/domain/constants.js';

/**
 * @function
 * @param {object} params
 * @param {number} params.sessionId
 * @param {SCOCertificationCandidate[]} params.scoCertificationCandidates
 * @returns {Promise<SCOCertificationCandidate[]>} - returns only the actually enrolled ones, not the ones already enrolled
 */
export async function addNonEnrolledCandidatesToSession({ sessionId, scoCertificationCandidates }) {
  const knexConn = DomainTransaction.getConnection();

  const organizationLearnerIds = scoCertificationCandidates.map((candidate) => candidate.organizationLearnerId);

  const alreadyEnrolledCandidates = await knexConn
    .select(['id', 'organizationLearnerId'])
    .from('certification-candidates')
    .whereIn('organizationLearnerId', organizationLearnerIds)
    .where({ sessionId });

  const alreadyEnrolledCandidateOrganizationLearnerIds = new Set(
    alreadyEnrolledCandidates.map((c) => c.organizationLearnerId),
  );

  const scoCandidateToDTO = _scoCandidateToDTOForSession(sessionId);
  const scoCertificationCandidatesToEnroll = scoCertificationCandidates.filter((candidate) => {
    const alreadyEnrolled = alreadyEnrolledCandidateOrganizationLearnerIds.has(candidate.organizationLearnerId);
    if (alreadyEnrolled) {
      candidate.id = alreadyEnrolledCandidates.find(
        (alreadyEnrolledCandidate) =>
          alreadyEnrolledCandidate.organizationLearnerId === candidate.organizationLearnerId,
      ).id;
      return false;
    }
    return true;
  });
  const candidateDTOs = scoCertificationCandidatesToEnroll.map(scoCandidateToDTO);

  if (candidateDTOs.length === 0) return;

  // We voluntarily keep the transaction contained in the repository as the usecase initiate a lengthy treatment
  await DomainTransaction.execute(async () => {
    const trxConn = DomainTransaction.getConnection();
    const insertedCandidateDTOs = await trxConn('certification-candidates')
      .insert(candidateDTOs)
      .returning(['id', 'firstName', 'lastName', 'birthdate']);

    const subscriptionsData = [];
    for (const scoCertificationCandidate of scoCertificationCandidatesToEnroll) {
      scoCertificationCandidate.id = insertedCandidateDTOs.find(
        (insertedCandidateData) =>
          insertedCandidateData.firstName === scoCertificationCandidate.firstName &&
          insertedCandidateData.lastName === scoCertificationCandidate.lastName &&
          insertedCandidateData.birthdate === scoCertificationCandidate.birthdate,
      ).id;

      subscriptionsData.push({
        certificationCandidateId: scoCertificationCandidate.id,
        type: SUBSCRIPTION_TYPES.CORE,
      });
    }
    await trxConn('certification-subscriptions').insert(subscriptionsData);
  });
  return scoCertificationCandidatesToEnroll;
}

/**
 * @typedef {object} SCOCertificationCandidateDTO
 * @property {string} firstName
 * @property {string} lastName
 * @property {Date} birthdate
 * @property {string} organizationLearnerId
 * @property {string} sex
 * @property {string} birthINSEECode
 * @property {string} birthCity
 * @property {string} birthCountry
 * @property {number} sessionId
 */

/**
 * @function
 * @param {number} sessionId
 * @returns {function(SCOCertificationCandidate): SCOCertificationCandidateDTO}
 */
function _scoCandidateToDTOForSession(sessionId) {
  return (scoCandidate) => ({
    firstName: scoCandidate.firstName,
    lastName: scoCandidate.lastName,
    birthdate: scoCandidate.birthdate,
    organizationLearnerId: scoCandidate.organizationLearnerId,
    sex: scoCandidate.sex,
    birthINSEECode: scoCandidate.birthINSEECode,
    birthCity: scoCandidate.birthCity,
    birthCountry: scoCandidate.birthCountry,
    subscription: scoCandidate.subscription,
    sessionId,
  });
}
