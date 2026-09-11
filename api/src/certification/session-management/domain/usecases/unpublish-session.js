import { NotFoundError } from '../../../../shared/domain/errors.js';

export async function unpublishSession({
  sessionId,
  certificationRepository,
  sessionManagementRepository,
  finalizedSessionRepository,
}) {
  const session = await sessionManagementRepository.get({ id: sessionId });

  if (!session) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }

  await certificationRepository.unpublishCertificationCoursesBySessionId({ sessionId });

  session.publishedAt = null;

  await sessionManagementRepository.updatePublishedAt({ id: sessionId, publishedAt: session.publishedAt });

  await _updateFinalizedSession(finalizedSessionRepository, sessionId);

  return sessionManagementRepository.get({ id: sessionId });
}

async function _updateFinalizedSession(finalizedSessionRepository, sessionId) {
  const finalizedSession = await finalizedSessionRepository.get({ sessionId });
  finalizedSession.unpublish();
  await finalizedSessionRepository.save({ finalizedSession });
}
