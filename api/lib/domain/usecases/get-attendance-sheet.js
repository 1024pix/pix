const odsService = require('../services/ods-service');
const sessionXmlService = require('../services/session-xml-service');
const { UserNotAuthorizedToAccessEntity } = require('../errors');
const moment = require('moment');
const _ = require('lodash');

const ATTENDANCE_SHEET_TEMPLATE_VALUES = [
  {
    placeholder: 'SESSION_ID',
    propertyName: 'id',
  },
  {
    placeholder: 'SESSION_START_DATE',
    propertyName: 'date',
  },
  {
    placeholder: 'SESSION_START_TIME',
    propertyName: 'startTime',
  },
  {
    placeholder: 'SESSION_END_TIME',
    propertyName: 'endTime',
  },
  {
    placeholder: 'SESSION_ADDRESS',
    propertyName: 'address',
  },
  {
    placeholder: 'SESSION_ROOM',
    propertyName: 'room',
  },
  {
    placeholder: 'SESSION_EXAMINER',
    propertyName: 'examiner',
  },
  {
    placeholder: 'CERTIFICATION_CENTER_NAME',
    propertyName: 'certificationCenterName',
  },
];

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
  const stringifiedUpdatedXml = sessionXmlService.getUpdatedXmlWithSessionData({ stringifiedXml, dataToInject: attendanceSheetData, templateValues: ATTENDANCE_SHEET_TEMPLATE_VALUES });

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
