const odsService = require('../services/ods-service');
const xmlService = require('../services/xml-service');
const moment = require('moment');

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

async function getAttendanceSheet({ sessionId, sessionRepository }) {
  const stringifiedXml = await odsService.getContentXml({ odsFilePath: _getAttendanceTemplatePath() });
  const session = await sessionRepository.get(sessionId);
  const attendanceSheetData = _buildAttendanceSheetData(session);
  const stringifiedUpdatedXml = xmlService.getUpdatedXml({ stringifiedXml, dataToInject: attendanceSheetData, templateValues: ATTENDANCE_SHEET_TEMPLATE_VALUES });

  return await odsService.makeUpdatedOdsByContentXml({ stringifiedXml: stringifiedUpdatedXml, odsFilePath: _getAttendanceTemplatePath() });
}

function _buildAttendanceSheetData(session) {
  const attendanceSheetData = Object.assign({}, session);
  attendanceSheetData.certificationCenterName = session.certificationCenter;
  delete attendanceSheetData.certificationCenter;
  attendanceSheetData.date = moment(session.date).format('DD/MM/YYYY');
  const startTime = moment(session.time, 'HH:mm');
  attendanceSheetData.startTime = startTime.format('HH:mm');
  attendanceSheetData.endTime = startTime.add(moment.duration(2, 'hours')).format('HH:mm');
  delete attendanceSheetData.time;

  return attendanceSheetData;
}

function _getAttendanceTemplatePath() {
  return process.cwd() + '/lib/domain/files/attendance_sheet_template.ods';
}
