/**
 * @typedef {import ('./index.js').CertificationEvaluationApi} CertificationEvaluationApi
 */

/**
 * @function
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {string} params.locale
 * @param {CertificationEvaluationApi} params.certificationEvaluationApi
 *
 * @returns {Promise<void>}
 */
export async function completeCertificationAssessment({ certificationCourseId, locale, certificationEvaluationApi }) {
  return certificationEvaluationApi.completeCertificationAssessment({
    certificationCourseId,
    locale,
  });
}

/**
 * @function
 * @param {object} params
 * @param {number} params.assessmentId
 * @param {CertificationEvaluationApi} params.certificationEvaluationApi
 *
 * @returns {Promise<string>} next challenge id
 */
export async function selectNextCertificationChallenge({ assessmentId, certificationEvaluationApi }) {
  return certificationEvaluationApi.selectNextCertificationChallenge({ assessmentId });
}

/**
 * @function
 * @param {object} params
 * @param {number} params.assessmentId
 * @param {CertificationEvaluationApi} params.certificationEvaluationApi
 *
 * @returns {Promise<{challengeLiveAlerts: Array<object>, companionLiveAlerts: Array<object>}>}
 */
export async function getAssessmentLiveAlerts({ assessmentId, certificationEvaluationApi }) {
  return certificationEvaluationApi.getAssessmentLiveAlerts({ assessmentId });
}
