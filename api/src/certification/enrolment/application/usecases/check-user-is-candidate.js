import * as candidateRepository from '../../infrastructure/repositories/candidate-repository.js';

const execute = async ({ userId, certificationCandidateId, dependencies = { candidateRepository } }) => {
  const candidate = await dependencies.candidateRepository.get({ certificationCandidateId });
  return candidate?.isLinkedTo(userId);
};

export { execute };
