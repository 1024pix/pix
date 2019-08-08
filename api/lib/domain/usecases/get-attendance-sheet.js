const odsService = require('../services/ods-service');
const sessionXmlService = require('../services/session-xml-service');
const { ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES } = require('./attendance-sheet-placeholders');
const { UserNotAuthorizedToAccessEntity } = require('../errors');
const moment = require('moment');
const _ = require('lodash');

module.exports = getAttendanceSheet;

async function getAttendanceSheet({ userId, sessionId, sessionRepository }) {

  try {
    await sessionRepository.ensureUserHasAccessToSession(userId, sessionId);
  } catch (err) {
    throw new UserNotAuthorizedToAccessEntity(sessionId);
  }

  const stringifiedXml = await odsService.getContentXml({ odsFilePath: _getAttendanceTemplatePath() });
  const session = await sessionRepository.get(sessionId);
  const attendanceSheetData = _.transform(session, transformSessionIntoAttendanceSheetData);
  const stringifiedUpdatedXml = sessionXmlService.getUpdatedXmlWithSessionData({ stringifiedXml, dataToInject: attendanceSheetData, templateValues: ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES });

  return await odsService.makeUpdatedOdsByContentXml({ stringifiedXml: stringifiedUpdatedXml, odsFilePath: _getAttendanceTemplatePath() });
}

function transformSessionIntoAttendanceSheetData(attendanceSheetData, value, prop) {
  switch (prop) {
    case 'certificationCenter':
      attendanceSheetData.certificationCenterName = value;
      break;
    case 'date':
      attendanceSheetData.date = moment(value).format('DD/MM/YYYY');
      break;
    case 'time':
      attendanceSheetData.startTime = moment(value, 'HH:mm').format('HH:mm');
      attendanceSheetData.endTime = moment(value, 'HH:mm').add(moment.duration(2, 'hours')).format('HH:mm');
      break;
    default:
      attendanceSheetData[prop] = value;
  }
}

function _getAttendanceTemplatePath() {
  return __dirname + '/../files/attendance_sheet_template.ods';
}
