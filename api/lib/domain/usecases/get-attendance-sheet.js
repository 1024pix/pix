import { UserNotAuthorizedToAccessEntityError } from '../errors.js';

const getAttendanceSheet = async function ({
  userId,
  sessionId,
  sessionRepository,
  sessionForAttendanceSheetRepository,
  attendanceSheetPdfUtils,
}) {
  const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(userId, sessionId);
  if (!hasMembership) {
    throw new UserNotAuthorizedToAccessEntityError('User is not allowed to access session.');
  }

  const session = await sessionForAttendanceSheetRepository.getWithCertificationCandidates(sessionId);

  return attendanceSheetPdfUtils.getAttendanceSheetPdfBuffer({ session });
};

export { getAttendanceSheet };
