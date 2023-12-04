/**
 * @typedef {import('../../../shared/domain/usecases/index.js').SessionRepository} SessionRepository
 *
 * @typedef {import('../../../shared/domain/usecases/index.js').SessionForAttendanceSheetRepository} SessionForAttendanceSheetRepository
 *
 *
 * @typedef {import('../../../shared/domain/usecases/index.js').AttendanceSheetPdfUtils} AttendanceSheetPdfUtils
 */

import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';

/**
 * @param {Object} params
 * @param {SessionRepository} params.sessionRepository
 * @param {SessionForAttendanceSheetRepository} params.sessionForAttendanceSheetRepository
 * @param {AttendanceSheetPdfUtils} params.attendanceSheetPdfUtils
 */
const getAttendanceSheet = async function ({
  userId,
  sessionId,
  i18n,
  sessionRepository,
  sessionForAttendanceSheetRepository,
  attendanceSheetPdfUtils,
}) {
  const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(userId, sessionId);
  if (!hasMembership) {
    throw new UserNotAuthorizedToAccessEntityError('User is not allowed to access session.');
  }

  const session = await sessionForAttendanceSheetRepository.getWithCertificationCandidates(sessionId);

  const { attendanceSheet, fileName } = await attendanceSheetPdfUtils.getAttendanceSheetPdfBuffer({
    session,
    i18n,
  });

  return { attendanceSheet, fileName };
};

export { getAttendanceSheet };
