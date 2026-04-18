/**
 * @typedef {import ('./index.js').CertificationEvaluationApi} CertificationEvaluationApi
 * @typedef {import ('../../../certification/evaluation/domain/errors.js').AssessmentEndedError} AssessmentEndedError
 * @typedef {import ('../../../evaluation/domain/models/ChallengeToPlay.js').ChallengeToPlay} ChallengeToPlay
 */

/**
 * @function
 * @param {object} params
 * @param {number} params.assessmentId - certification assessment id
 * @param {string} params.locale - candidate locale
 * @param {CertificationEvaluationApi} params.certificationEvaluationApi
 *
 * @returns {ChallengeToPlay}
 * @throws {AssessmentEndedError} test ended or no next challenge available
 */
export const selectNextCertificationChallenge = async function ({ assessmentId, locale, certificationEvaluationApi }) {
  return certificationEvaluationApi.selectNextCertificationChallenge({
    assessmentId,
    locale,
  });
};
