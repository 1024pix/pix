import * as injectedCandidateRepository from '../../infrastructure/repositories/candidate-repository.js'; /**
 * @typedef {import('./index.js').CandidateRepository} CandidateRepository
 */

/**
 * @param {Object} params
 * @param {CandidateRepository} params.candidateRepository
 */
export async function getCandidate({
  certificationCandidateId,
  candidateRepository = injectedCandidateRepository,
} = {}) {
  return candidateRepository.get({ certificationCandidateId });
}
