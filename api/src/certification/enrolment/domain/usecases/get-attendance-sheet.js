/**
 * @typedef {import('./index.js').SessionForAttendanceSheetRepository} SessionForAttendanceSheetRepository
 * @typedef {import('./index.js').AttendanceSheetPdfUtils} AttendanceSheetPdfUtils
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
  const session = await sessionForAttendanceSheetRepository.getWithCertificationCandidates({ id: sessionId });

  const { attendanceSheet, fileName } = await attendanceSheetPdfUtils.getAttendanceSheetPdfBuffer({
    session,
    i18n,
  });

  return { attendanceSheet, fileName };
};

export { getAttendanceSheet };
