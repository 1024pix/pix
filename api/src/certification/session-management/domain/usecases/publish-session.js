import { NotFoundError } from '../../../../shared/domain/errors.js';
import { AssessmentResult } from '../../../../shared/domain/models/AssessmentResult.js';
import { CertificationCourseNotPublishableError, SessionAlreadyPublishedError } from '../errors.js';

export async function publishSession({
  sessionId,
  certificationRepository,
  finalizedSessionRepository,
  sessionManagementRepository,
}) {
  const session = await sessionManagementRepository.get({ id: sessionId });
  if (!session) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }

  if (session.isPublished()) {
    throw new SessionAlreadyPublishedError();
  }

  const certificationCourseIds = await certificationRepository.getStatusesBySessionId(sessionId);

  if (isAnyCertificationNotPublishable(certificationCourseIds)) {
    throw new CertificationCourseNotPublishableError(sessionId);
  }

  const finalizedSession = await updateFinalizedSession(finalizedSessionRepository, sessionId);
  await certificationRepository.publishCertificationCourses({
    certificationCourseIds,
    publishedAt: finalizedSession.publishedAt,
  });
  await sessionManagementRepository.updatePublishedAt({ id: sessionId, publishedAt: finalizedSession.publishedAt });
}

async function updateFinalizedSession(finalizedSessionRepository, sessionId) {
  const finalizedSession = await finalizedSessionRepository.get({ sessionId });
  finalizedSession.publish();
  await finalizedSessionRepository.save({ finalizedSession });
  return finalizedSession;
}

function isAnyCertificationNotPublishable(certificationStatuses) {
  const hasCertificationWithNoAssessmentResultStatus = hasCertificationWithNoScoring(certificationStatuses);
  return hasCertificationInError(certificationStatuses) || hasCertificationWithNoAssessmentResultStatus;
}

function hasCertificationInError(certificationStatus) {
  return certificationStatus.some(
    ({ pixCertificationStatus }) => pixCertificationStatus === AssessmentResult.status.ERROR,
  );
}

function hasCertificationWithNoScoring(certificationStatuses) {
  return certificationStatuses.some(({ pixCertificationStatus }) => pixCertificationStatus === null);
}
