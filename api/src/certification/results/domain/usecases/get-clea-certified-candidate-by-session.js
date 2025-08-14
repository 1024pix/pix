import * as injectedSessionEnrolmentRepository from '../../../enrolment/infrastructure/repositories/session-repository.js';
import * as injectedCleaCertifiedCandidateRepository from '../../infrastructure/repositories/clea-certified-candidate-repository.js';
const getCleaCertifiedCandidateBySession = async function ({
  sessionId,
  cleaCertifiedCandidateRepository = injectedCleaCertifiedCandidateRepository,
  sessionEnrolmentRepository = injectedSessionEnrolmentRepository,
} = {}) {
  const cleaCertifiedCandidateData = await cleaCertifiedCandidateRepository.getBySessionId(sessionId);
  const session = await sessionEnrolmentRepository.get({ id: sessionId });

  return { session, cleaCertifiedCandidateData };
};

export { getCleaCertifiedCandidateBySession };
