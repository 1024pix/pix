/**
 * @typedef {import ('../../../../../lib/infrastructure/plugins/i18n.js')} i18n
 * @typedef {import ('../../../session/infrastructure/repositories/session-repository.js')} sessionRepository
 * @typedef {import ('../../../session/infrastructure/repositories/session-for-attendance-sheet-repository.js')} sessionForAttendanceSheetRepository
 * @typedef {import ('../../../session/infrastructure/utils/pdf/attendance-sheet-pdf.js')} attendanceSheetPdfUtils
 */

import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';

/**
 * @param {Object} deps
 * @param {i18n} deps.i18n
 * @param {sessionRepository} deps.sessionRepository
 * @param {sessionForAttendanceSheetRepository} deps.sessionForAttendanceSheetRepository
 * @param {attendanceSheetPdfUtils} deps.attendanceSheetPdfUtils
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
