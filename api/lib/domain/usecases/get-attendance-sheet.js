const writeOdsUtils = require('../../infrastructure/utils/ods/write-ods-utils');
const readOdsUtils = require('../../infrastructure/utils/ods/read-ods-utils');
const sessionXmlService = require('../services/session-xml-service');
const {
  EXTRA_EMPTY_CANDIDATE_ROWS,
  ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES,
  ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES
} = require('./../../infrastructure/files/attendance-sheet/attendance-sheet-placeholders');
const moment = require('moment');
const _ = require('lodash');

module.exports = async function getAttendanceSheet({ userId, sessionId, sessionRepository }) {

  await sessionRepository.ensureUserHasAccessToSession(userId, sessionId);

  const [ stringifiedXml, session ] = await Promise.all([
    readOdsUtils.getContentXml({ odsFilePath: _getAttendanceTemplatePath() }),
    sessionRepository.getWithCertificationCandidates(sessionId),
  ]);

  const updatedStringifiedXml = _updateXmlWithSession(stringifiedXml, session);

  return writeOdsUtils.makeUpdatedOdsByContentXml({ stringifiedXml: updatedStringifiedXml, odsFilePath: _getAttendanceTemplatePath() });
};

function _updateXmlWithSession(stringifiedXml, session) {
  const sessionData = _.transform(session, _transformSessionIntoAttendanceSheetSessionData);
  const updatedStringifiedXml = sessionXmlService.getUpdatedXmlWithSessionData({
    stringifiedXml,
    sessionData,
    sessionTemplateValues: ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES,
  });

  return _updateXmlWithCertificationCandidates(updatedStringifiedXml, session.certificationCandidates);
}

function _updateXmlWithCertificationCandidates(stringifiedXml, certificationCandidates) {
  const candidatesData = _.map(certificationCandidates, (candidate, index) => {
    const candidateData = _.transform(candidate, _transformCandidateIntoAttendanceSheetCandidateData);
    candidateData.count = index + 1;
    return candidateData;
  });
  _.times(EXTRA_EMPTY_CANDIDATE_ROWS, () => {
    const emptyCandidateData = {};
    _.each(ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES, (templateVal) => {
      emptyCandidateData[templateVal.propertyName] = '';
    });
    emptyCandidateData.count = candidatesData.length + 1;
    candidatesData.push(emptyCandidateData);
  });

  return sessionXmlService.getUpdatedXmlWithCertificationCandidatesData({
    stringifiedXml,
    candidatesData,
    candidateTemplateValues: ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES,
  });
}

function _transformSessionIntoAttendanceSheetSessionData(attendanceSheetData, value, prop) {
  switch (prop) {
    case 'certificationCenter':
      attendanceSheetData.certificationCenterName = value;
      break;
    case 'time':
      attendanceSheetData.startTime = moment(value, 'HH:mm').format('HH:mm');
      attendanceSheetData.endTime = moment(value, 'HH:mm').add(moment.duration(2, 'hours')).format('HH:mm');
      break;
    case 'date':
      attendanceSheetData.date = moment(value, 'YYYY-MM-DD').format('DD/MM/YYYY');
      break;
    case 'certificationCandidates':
      break;
    default:
      attendanceSheetData[prop] = value;
  }
}

function _transformCandidateIntoAttendanceSheetCandidateData(attendanceSheetData, value, prop) {
  switch (prop) {
    case 'extraTimePercentage':
      if (!_.isFinite(value) || value <= 0) {
        attendanceSheetData.extraTimePercentage = '';
      } else {
        attendanceSheetData.extraTimePercentage = value;
      }
      break;
    case 'birthdate':
      attendanceSheetData[prop] = value === null ? '' : moment(value, 'YYYY-MM-DD').format('YYYY-MM-DD');
      break;
    default:
      attendanceSheetData[prop] = value === null ? '' : value;
      break;
  }
}

function _getAttendanceTemplatePath() {
  return __dirname + '/../../infrastructure/files/attendance-sheet/attendance_sheet_template.ods';
}
