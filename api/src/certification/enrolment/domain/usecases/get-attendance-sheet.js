/**
 * @typedef {import('./index.js').SessionForAttendanceSheetRepository} SessionForAttendanceSheetRepository
 * @typedef {import('./index.js').AttendanceSheetPdfUtils} AttendanceSheetPdfUtils
 */

import { NotFoundError } from '../../../../shared/domain/errors.js';

/**
 * @param {object} params
 * @param {SessionForAttendanceSheetRepository} params.sessionForAttendanceSheetRepository
 * @param {AttendanceSheetPdfUtils} params.attendanceSheetPdfUtils
 * @throws {NotFoundError} the session does not exist or no candidate is enrolled in it
 */
export async function getAttendanceSheet({
  sessionId,
  i18n,
  sessionForAttendanceSheetRepository,
  attendanceSheetPdfUtils,
}) {
  const session = await sessionForAttendanceSheetRepository.getWithCertificationCandidates({ id: sessionId });

  if (!session) {
    throw new NotFoundError("La session n'existe pas ou aucun candidat n'est inscrit à celle-ci");
  }

  const { attendanceSheet, fileName } = await attendanceSheetPdfUtils.getAttendanceSheetPdfBuffer({
    session,
    i18n,
  });

  return { attendanceSheet, fileName };
}
