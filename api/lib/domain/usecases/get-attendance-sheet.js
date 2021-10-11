const _ = require('lodash');
const moment = require('moment');
const writeOdsUtils = require('../../infrastructure/utils/ods/write-ods-utils');
const readOdsUtils = require('../../infrastructure/utils/ods/read-ods-utils');
const sessionXmlService = require('../services/session-xml-service');
const { UserNotAuthorizedToAccessEntityError } = require('../errors');
const {
  EXTRA_EMPTY_CANDIDATE_ROWS,
  NON_SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES,
  SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES,
  ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES,
} = require('./../../infrastructure/files/attendance-sheet/attendance-sheet-placeholders');

module.exports = async function getAttendanceSheet({ userId, sessionId, sessionRepository, sessionForAttendanceSheetRepository }) {

  const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(userId, sessionId);
  if (!hasMembership) {
    throw new UserNotAuthorizedToAccessEntityError('User is not allowed to access session.');
  }

  const session = await sessionForAttendanceSheetRepository.getWithCertificationCandidates(sessionId);
  const stringifiedXml = await readOdsUtils.getContentXml({ odsFilePath: _getAttendanceSheetTemplatePath(session.certificationCenterType) });

  const updatedStringifiedXml = _updateXmlWithSession(stringifiedXml, session);

  return writeOdsUtils.makeUpdatedOdsByContentXml({ stringifiedXml: updatedStringifiedXml, odsFilePath: _getAttendanceSheetTemplatePath(session.certificationCenterType) });
};

function _updateXmlWithSession(stringifiedXml, session) {
  const sessionData = _.transform(session, _transformSessionIntoAttendanceSheetSessionData);
  const updatedStringifiedXml = sessionXmlService.getUpdatedXmlWithSessionData({
    stringifiedXml,
    sessionData,
    sessionTemplateValues: ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES,
  });

  return _attendanceSheetWithCertificationCandidates(updatedStringifiedXml, session);
}

function _attendanceSheetWithCertificationCandidates(stringifiedXml, session) {
  const candidateTemplateValues = session.certificationCenterType === 'SCO'
    ? SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES
    : NON_SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES;

  const candidatesData = _.map(session.certificationCandidates, (candidate, index) => {
    const candidateData = _.transform(candidate, _transformCandidateIntoAttendanceSheetCandidateData);
    candidateData.count = index + 1;
    return candidateData;
  });
  _.times(EXTRA_EMPTY_CANDIDATE_ROWS, () => {
    const emptyCandidateData = {};
    _.each(candidateTemplateValues, (templateVal) => {
      emptyCandidateData[templateVal.propertyName] = '';
    });
    emptyCandidateData.count = candidatesData.length + 1;
    candidatesData.push(emptyCandidateData);
  });

  return sessionXmlService.getUpdatedXmlWithCertificationCandidatesData({
    stringifiedXml,
    candidatesData,
    candidateTemplateValues,
  });
}

function _transformSessionIntoAttendanceSheetSessionData(attendanceSheetData, value, prop) {
  switch (prop) {
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

function _getAttendanceSheetTemplatePath(certificationCenterType) {
  if (certificationCenterType === 'SCO') {
    return __dirname + '/../../infrastructure/files/attendance-sheet/sco_attendance_sheet_template.ods';
  }
  return __dirname + '/../../infrastructure/files/attendance-sheet/non_sco_attendance_sheet_template.ods';
}
