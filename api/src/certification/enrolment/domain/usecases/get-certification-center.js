/**
 * @typedef {import('./index.js').CertificationCenterRepository} CertificationCenterRepository
 */

/**
 * @param {Object} params
 * @param {SessionForAttendanceSheetRepository} params.sessionForAttendanceSheetRepository
 * @param {AttendanceSheetPdfUtils} params.attendanceSheetPdfUtils
 */
const getCertificationCenter = function ({ id, certificationCenterRepository }) {
  return certificationCenterRepository.get({ id });
};

export { getCertificationCenter };
