import FinalizedSession from '../../../../lib/domain/models/FinalizedSession';

export default function buildFinalizedSession({
  sessionId = 123,
  certificationCenterName = 'Centre de certif pix',
  sessionDate = '2020-12-01',
  sessionTime = '14:30',
  finalizedAt = '2021-01-12',
  publishedAt = null,
  isPublishable = true,
  assignedCertificationOfficerName = null,
} = {}) {
  return new FinalizedSession({
    sessionId,
    certificationCenterName,
    sessionDate,
    sessionTime,
    finalizedAt,
    publishedAt,
    isPublishable,
    assignedCertificationOfficerName,
  });
}
