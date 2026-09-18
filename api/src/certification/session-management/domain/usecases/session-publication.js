import { NotFoundError } from '../../../../shared/domain/errors.js';
import { AssessmentResult } from '../../../../shared/domain/models/AssessmentResult.js';
import { CertificationCourseNotPublishableError, SessionAlreadyPublishedError } from '../errors.js';

export async function sessionPublication({
  sessionId,
  publishedAt,
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

  await certificationRepository.publishCertificationCourses({ certificationCourseIds, publishedAt });

  await sessionManagementRepository.updatePublishedAt({ id: sessionId, publishedAt });

  await updateFinalizedSession(finalizedSessionRepository, sessionId, publishedAt);
}

async function updateFinalizedSession(finalizedSessionRepository, sessionId, publishedAt) {
  const finalizedSession = await finalizedSessionRepository.get({ sessionId });
  finalizedSession.publish(publishedAt);
  await finalizedSessionRepository.save({ finalizedSession });
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
