import * as candidateRepository from '../../infrastructure/repositories/candidate-repository.js';

export async function execute({ userId, certificationCandidateId, dependencies = { candidateRepository } }) {
  const candidate = await dependencies.candidateRepository.get({ certificationCandidateId });
  return candidate?.isReconciledTo(userId);
}
