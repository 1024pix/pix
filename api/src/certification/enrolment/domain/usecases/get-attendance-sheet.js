import * as injectedSessionForAttendanceSheetRepository from '../../infrastructure/repositories/session-for-attendance-sheet-repository.js';
import * as injectedAttendanceSheetPdfUtils from '../../infrastructure/utils/pdf/attendance-sheet-pdf.js'; /**
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
  sessionForAttendanceSheetRepository = injectedSessionForAttendanceSheetRepository,
  attendanceSheetPdfUtils = injectedAttendanceSheetPdfUtils,
} = {}) {
  const session = await sessionForAttendanceSheetRepository.getWithCertificationCandidates({ id: sessionId });

  const { attendanceSheet, fileName } = await attendanceSheetPdfUtils.getAttendanceSheetPdfBuffer({
    session,
    i18n,
  });

  return { attendanceSheet, fileName };
};

export { getAttendanceSheet };
