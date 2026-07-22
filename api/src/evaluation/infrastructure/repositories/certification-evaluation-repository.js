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
