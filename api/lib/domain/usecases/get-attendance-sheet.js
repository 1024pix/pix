const _ = require('lodash');
const moment = require('moment');
const writeOdsUtils = require('../../infrastructure/utils/ods/write-ods-utils');
const readOdsUtils = require('../../infrastructure/utils/ods/read-ods-utils');
const { UserNotAuthorizedToAccessEntityError } = require('../errors');
const {
  EXTRA_EMPTY_CANDIDATE_ROWS,
  NON_SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES,
  SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES,
  ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES,
} = require('./../../infrastructure/files/attendance-sheet/attendance-sheet-placeholders');

module.exports = async function getAttendanceSheet({
  userId,
  sessionId,
  sessionRepository,
  sessionForAttendanceSheetRepository,
  endTestScreenRemovalService,
}) {
  const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(userId, sessionId);
  if (!hasMembership) {
    throw new UserNotAuthorizedToAccessEntityError('User is not allowed to access session.');
  }

  const isEndTestScreenRemovalEnabled = await endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId(
    sessionId
  );
  const addEndTestScreenColumn = !isEndTestScreenRemovalEnabled;

  const session = await sessionForAttendanceSheetRepository.getWithCertificationCandidates(sessionId);
  const odsFilePath = _getAttendanceSheetTemplatePath(
    session.certificationCenterType,
    session.isOrganizationManagingStudents,
    addEndTestScreenColumn
  );
  const template = await readOdsUtils.getContentXml({ odsFilePath: odsFilePath });
  const odsBuilder = new writeOdsUtils.OdsUtilsBuilder(template);

  const updatedStringifiedXml = _updateXmlWithSession({ odsBuilder, session });

  return writeOdsUtils.makeUpdatedOdsByContentXml({
    stringifiedXml: updatedStringifiedXml,
    odsFilePath,
  });
};

function _updateXmlWithSession({ odsBuilder, session }) {
  const sessionData = _.transform(session, _transformSessionIntoAttendanceSheetSessionData);
  odsBuilder.withData(sessionData, ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES);

  let candidateTemplateValues = NON_SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES;

  if (session.certificationCenterType === 'SCO' && session.isOrganizationManagingStudents) {
    candidateTemplateValues = SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES;
  }

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

  const CANDIDATE_ROW_MARKER_PLACEHOLDER = 'COUNT';
  odsBuilder.updateXmlRows({
    rowMarkerPlaceholder: CANDIDATE_ROW_MARKER_PLACEHOLDER,
    rowTemplateValues: candidateTemplateValues,
    dataToInject: candidatesData,
  });

  return odsBuilder.buildToString();
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

function _getAttendanceSheetTemplatePath(
  certificationCenterType,
  isOrganizationManagingStudents,
  addEndTestScreenColumn
) {
  const suffix = addEndTestScreenColumn ? '_with_fdt' : '';
  const templatePath = __dirname + '/../../infrastructure/files/attendance-sheet';
  if (certificationCenterType === 'SCO' && isOrganizationManagingStudents) {
    return `${templatePath}/sco_attendance_sheet_template${suffix}.ods`;
  }
  return `${templatePath}/non_sco_attendance_sheet_template${suffix}.ods`;
}
