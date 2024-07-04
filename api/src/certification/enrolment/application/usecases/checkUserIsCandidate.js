import * as candidateRepository from '../../infrastructure/repositories/candidate-repository.js';

const execute = async ({ userId, certificationCandidateId, dependencies = { candidateRepository } }) => {
  return dependencies.candidateRepository.isUserCertificationCandidate({
    certificationCandidateId,
    userId,
  });
};

export { execute };
