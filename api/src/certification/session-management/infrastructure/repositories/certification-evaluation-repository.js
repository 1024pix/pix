/**
 * @typedef {import('../../../../../src/shared/domain/events/CertificationCancelled.js').CertificationCancelled} CertificationCancelled
 * @typedef {import('../../../../../src/shared/domain/events/CertificationUncancelled.js').CertificationUncancelled} CertificationUncancelled
 * @typedef {import('./index.js').CertificationEvaluationApi} CertificationEvaluationApi
 */

/**
 * @param {object} params
 * @param {CertificationJuryDone|CertificationCourseRejected|CertificationCourseUnrejected|CertificationCancelled|CertificationRescored|CertificationUncancelled} params.event
 * @param {CertificationEvaluationApi} params.certificationEvaluationApi
 * @returns {Promise<void>}
 */
export async function rescoreV3Certification({ event, certificationEvaluationApi }) {
  return certificationEvaluationApi.rescoreV3Certification({
    event,
  });
}

/**
 * @param {object} params
 * @param {ChallengeNeutralized|ChallengeDeneutralized|CertificationJuryDone|CertificationCourseRejected|CertificationCourseUnrejected|CertificationCancelled|CertificationRescored|CertificationUncancelled} params.event
 * @param {CertificationEvaluationApi} params.certificationEvaluationApi
 * @returns {Promise<void>}
 */
export async function rescoreV2Certification({ event, certificationEvaluationApi }) {
  return certificationEvaluationApi.rescoreV2Certification({
    event,
  });
}
