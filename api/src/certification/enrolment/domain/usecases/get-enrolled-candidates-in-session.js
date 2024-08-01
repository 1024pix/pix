/**
 * @typedef {import("./index.js").EnrolledCandidateRepository} EnrolledCandidateRepository
 * @typedef {import("../read-models/EnrolledCandidate.js").EnrolledCandidate} EnrolledCandidate
 */

/**
 * @function
 * @param {Object} params
 * @param {EnrolledCandidateRepository} params.enrolledCandidateRepository
 * @returns {Promise<Array<EnrolledCandidate>>}
 */
export async function getEnrolledCandidatesInSession({ sessionId, enrolledCandidateRepository }) {
  return enrolledCandidateRepository.findBySessionId({ sessionId });
}
