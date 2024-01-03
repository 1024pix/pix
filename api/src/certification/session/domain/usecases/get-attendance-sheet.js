/**
 * @typedef {import('../../../shared/domain/usecases/index.js').SessionForAttendanceSheetRepository} SessionForAttendanceSheetRepository
 * @typedef {import('../../../shared/domain/usecases/index.js').AttendanceSheetPdfUtils} AttendanceSheetPdfUtils
 */

/**
 * @param {Object} params
 * @param {SessionForAttendanceSheetRepository} params.sessionForAttendanceSheetRepository
 * @param {AttendanceSheetPdfUtils} params.attendanceSheetPdfUtils
 */
const getAttendanceSheet = async function ({
  sessionId,
  i18n,
  sessionForAttendanceSheetRepository,
  attendanceSheetPdfUtils,
}) {
  const session = await sessionForAttendanceSheetRepository.getWithCertificationCandidates(sessionId);

  const { attendanceSheet, fileName } = await attendanceSheetPdfUtils.getAttendanceSheetPdfBuffer({
    session,
    i18n,
  });

  return { attendanceSheet, fileName };
};

export { getAttendanceSheet };
