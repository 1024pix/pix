import * as injectedCertificationCandidateForSupervisingRepository from '../../infrastructure/repositories/certification-candidate-for-supervising-repository.js';

const authorizeCertificationCandidateToResume = async function ({
  certificationCandidateId,
  certificationCandidateForSupervisingRepository = injectedCertificationCandidateForSupervisingRepository,
} = {}) {
  const candidate = await certificationCandidateForSupervisingRepository.get({ certificationCandidateId });
  candidate.authorizeToStart();

  await certificationCandidateForSupervisingRepository.update(candidate);
};

export { authorizeCertificationCandidateToResume };
