import { UserNotAuthorizedToAccessEntityError } from '../errors.js';

const getCandidateImportSheetData = async function ({
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
};

export { getCandidateImportSheetData };
