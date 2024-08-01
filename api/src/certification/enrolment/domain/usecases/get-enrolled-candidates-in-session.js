/**
 * @typedef {import("./index.js").EnrolledCandidateRepository} EnrolledCandidateRepository
 */

/**
 * @function
 * @param {Object} params
 * @param {EnrolledCandidateRepository} params.enrolledCandidateRepository
 * @returns [{EnrolledCandidate}]
 */
export async function getEnrolledCandidatesInSession({ sessionId, enrolledCandidateRepository }) {
  return enrolledCandidateRepository.findBySessionId({ sessionId });
}
