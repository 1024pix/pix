import { UserNotAuthorizedToAccessEntityError } from '../errors';

export default async function getCandidateImportSheetData({
  userId,
  sessionId,
  sessionRepository,
  certificationCenterRepository,
}) {
  const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(userId, sessionId);
  if (!hasMembership) {
    throw new UserNotAuthorizedToAccessEntityError('User is not allowed to access session.');
  }

  const session = await sessionRepository.getWithCertificationCandidates(sessionId);
  const certificationCenter = await certificationCenterRepository.getBySessionId(sessionId);

  return {
    session,
    certificationCenterHabilitations: certificationCenter.habilitations,
    isScoCertificationCenter: certificationCenter.isSco,
  };
}
