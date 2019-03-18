const odsFileManager = require('../services/get-attendance-sheet/ods-file-manager');
const insertSessionDataIntoXml = require('../services/get-attendance-sheet/insert-session-data-into-xml');

const ATTENDANCE_TEMPLATE_PATH = process.cwd() + '/lib/domain/files/attendance_sheet_template.ods';

module.exports = getAttendanceSheet;

async function getAttendanceSheet({ sessionId, sessionRepository }) {
  const stringifiedXml = await odsFileManager.getContentXml({ odsFilePath: ATTENDANCE_TEMPLATE_PATH });

  const session = await sessionRepository.get(sessionId);
  const stringifiedUpdatedXml = insertSessionDataIntoXml({ stringifiedXml, session });

  return await odsFileManager.makeUpdatedOdsByContentXml({ stringifiedXml: stringifiedUpdatedXml, odsFilePath: ATTENDANCE_TEMPLATE_PATH });
}
