/**
 * @typedef {import("./index.js").CandidateRepository} CandidateRepository
 * @typedef {import("../models/Candidate.js").Candidate} Candidate
 */
import { Candidate } from '../models/Candidate.js';

/**
 * @function
 * @param {object} params
 * @param {CandidateRepository} params.candidateRepository
 * @returns {Promise<Array<Candidate>>}
 */
export async function getEnrolledCandidatesInSession({ sessionId, candidateRepository }) {
  const candidates = await candidateRepository.findBySessionId({ sessionId });
  return candidates.toSorted(Candidate.sortByLastNameAndFirstName);
}
