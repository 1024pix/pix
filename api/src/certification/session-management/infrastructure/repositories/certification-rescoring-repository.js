import * as injectedCertificationEvaluationApi from '../../../evaluation/application/api/rescore-certification-api.js';/**
 * @typedef {import('../../../../../src/shared/domain/events/CertificationCancelled.js'} CertificationCancelled
 * @typedef {import('../../../../../src/shared/domain/events/CertificationUncancelled.js'} CertificationUncancelled
 * @typedef {import('./index.js').CertificationEvaluationApi} CertificationEvaluationApi
 */

/**
 * @param {Object} params
 * @param {CertificationJuryDone|CertificationCourseRejected|CertificationCourseUnrejected|CertificationCancelled|CertificationRescored|CertificationUncancelled} params.event
 * @param {CertificationEvaluationApi} params.certificationEvaluationApi
 * @returns {Promise<void>}
 */
export const rescoreV3Certification = async (
  { event, certificationEvaluationApi = injectedCertificationEvaluationApi } = {},
) => {
  return certificationEvaluationApi.rescoreV3Certification({
    event,
  });
};

/**
 * @param {Object} params
 * @param {ChallengeNeutralized|ChallengeDeneutralized|CertificationJuryDone|CertificationCourseRejected|CertificationCourseUnrejected|CertificationCancelled|CertificationRescored|CertificationUncancelled} params.event
 * @param {CertificationEvaluationApi} params.certificationEvaluationApi
 * @returns {Promise<void>}
 */
export const rescoreV2Certification = async (
  { event, certificationEvaluationApi = injectedCertificationEvaluationApi } = {},
) => {
  return certificationEvaluationApi.rescoreV2Certification({
    event,
  });
};
