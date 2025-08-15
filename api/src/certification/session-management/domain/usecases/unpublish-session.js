import * as injectedSharedSessionRepository from '../../../shared/infrastructure/repositories/session-repository.js';
import * as injectedFinalizedSessionRepository from '../../infrastructure/repositories/finalized-session-repository.js';
import { certificationRepository as injectedCertificationRepository } from '../../infrastructure/repositories/index.js';
import * as injectedSessionRepository from '../../infrastructure/repositories/session-repository.js';
const unpublishSession = async function ({
  sessionId,
  certificationRepository = injectedCertificationRepository,
  sessionRepository = injectedSessionRepository,
  finalizedSessionRepository = injectedFinalizedSessionRepository,
  sharedSessionRepository = injectedSharedSessionRepository,
} = {}) {
  const session = await sharedSessionRepository.getWithCertificationCandidates({ id: sessionId });

  await certificationRepository.unpublishCertificationCoursesBySessionId({ sessionId });

  session.publishedAt = null;

  await sessionRepository.updatePublishedAt({ id: sessionId, publishedAt: session.publishedAt });

  await _updateFinalizedSession(finalizedSessionRepository, sessionId);

  return sharedSessionRepository.getWithCertificationCandidates({ id: sessionId });
};

export { unpublishSession };

async function _updateFinalizedSession(finalizedSessionRepository, sessionId) {
  const finalizedSession = await finalizedSessionRepository.get({ sessionId });
  finalizedSession.unpublish();
  await finalizedSessionRepository.save({ finalizedSession });
}
