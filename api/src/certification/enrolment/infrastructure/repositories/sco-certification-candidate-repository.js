// @ts-check
/**
 * @typedef {import ('../../domain/models/SCOCertificationCandidate.js').SCOCertificationCandidate} SCOCertificationCandidate
 */

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Subscription } from '../../domain/models/Subscription.js';

/**
 * @function
 * @param {object} params
 * @param {number} params.sessionId
 * @param {Array<SCOCertificationCandidate>} params.scoCertificationCandidates
 * @returns {Promise<void>}
 */
const addNonEnrolledCandidatesToSession = async function ({ sessionId, scoCertificationCandidates }) {
  await DomainTransaction.execute(async () => {
    const knexConn = DomainTransaction.getConnection();
    const organizationLearnerIds = scoCertificationCandidates.map((candidate) => candidate.organizationLearnerId);

    const alreadyEnrolledCandidate = await knexConn
      .select(['organizationLearnerId'])
      .from('certification-candidates')
      .whereIn('organizationLearnerId', organizationLearnerIds)
      .where({ sessionId });

    const alreadyEnrolledCandidateOrganizationLearnerIds = alreadyEnrolledCandidate.map(
      (candidate) => candidate.organizationLearnerId,
    );

    const scoCandidateToDTO = _scoCandidateToDTOForSession(sessionId);
    const candidatesToBeEnrolledDTOs = scoCertificationCandidates
      .filter((candidate) => !alreadyEnrolledCandidateOrganizationLearnerIds.includes(candidate.organizationLearnerId))
      .map((candidate) => scoCandidateToDTO(candidate));

    for (const candidateDTO of candidatesToBeEnrolledDTOs) {
      const { subscriptions, ...candidateToInsert } = candidateDTO;

      const [{ id }] = await knexConn('certification-candidates').insert(candidateToInsert).returning('id');

      subscriptions[0].certificationCandidateId = id;
      // eslint-disable-next-line no-unused-vars
      const { complementaryCertificationKey, ...subscriptionToInsert } = subscriptions[0];

      await knexConn('certification-subscriptions').insert(subscriptionToInsert);
    }
  });
};

export { addNonEnrolledCandidatesToSession };

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
 * @property {Array<Subscription>} subscriptions
 */

/**
 * @function
 * @param {number} sessionId
 * @returns {function(SCOCertificationCandidate): SCOCertificationCandidateDTO}
 */
function _scoCandidateToDTOForSession(sessionId) {
  return (scoCandidate) => {
    return {
      firstName: scoCandidate.firstName,
      lastName: scoCandidate.lastName,
      birthdate: scoCandidate.birthdate,
      organizationLearnerId: scoCandidate.organizationLearnerId,
      sex: scoCandidate.sex,
      birthINSEECode: scoCandidate.birthINSEECode,
      birthCity: scoCandidate.birthCity,
      birthCountry: scoCandidate.birthCountry,
      sessionId,
      subscriptions: [Subscription.buildCore({ certificationCandidateId: null })],
    };
  };
}
