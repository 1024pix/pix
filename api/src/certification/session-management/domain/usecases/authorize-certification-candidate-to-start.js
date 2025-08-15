import * as injectedCertificationCandidateForSupervisingRepository from '../../infrastructure/repositories/certification-candidate-for-supervising-repository.js'; /**
 *
 * @typedef {import('./index.js').CertificationCandidateForSupervisingRepository} CertificationCandidateForSupervisingRepository
 */

/**
 * @param {Object} params
 * @param {CertificationCandidateForSupervisingRepository} params.certificationCandidateForSupervisingRepository
 */
const authorizeCertificationCandidateToStart = async function ({
  certificationCandidateForSupervisingId,
  authorizedToStart,
  certificationCandidateForSupervisingRepository = injectedCertificationCandidateForSupervisingRepository,
} = {}) {
  await certificationCandidateForSupervisingRepository.update({
    id: certificationCandidateForSupervisingId,
    authorizedToStart,
  });
};

export { authorizeCertificationCandidateToStart };
