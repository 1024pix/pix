import * as injectedEnrolledCandidateRepository from '../../infrastructure/repositories/enrolled-candidate-repository.js'; /**
 * @typedef {import("./index.js").EnrolledCandidateRepository} EnrolledCandidateRepository
 * @typedef {import("../read-models/EnrolledCandidate.js").EnrolledCandidate} EnrolledCandidate
 */

/**
 * @function
 * @param {Object} params
 * @param {EnrolledCandidateRepository} params.enrolledCandidateRepository
 * @returns {Promise<Array<EnrolledCandidate>>}
 */
export async function getEnrolledCandidatesInSession({
  sessionId,
  enrolledCandidateRepository = injectedEnrolledCandidateRepository,
} = {}) {
  return enrolledCandidateRepository.findBySessionId({ sessionId });
}
