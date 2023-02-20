import _ from 'lodash';
import moment from 'moment';
import writeOdsUtils from '../../infrastructure/utils/ods/write-ods-utils';
import readOdsUtils from '../../infrastructure/utils/ods/read-ods-utils';
import sessionXmlService from '../services/session-xml-service';
import { UserNotAuthorizedToAccessEntityError } from '../errors';

import {
  EXTRA_EMPTY_CANDIDATE_ROWS,
  NON_SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES,
  SCO_ATTENDANCE_SHEET_CANDIDATE_TEMPLATE_VALUES,
  ATTENDANCE_SHEET_SESSION_TEMPLATE_VALUES,
} from './../../infrastructure/files/attendance-sheet/attendance-sheet-placeholders';

export default async function getAttendanceSheet({
  userId,
  sessionId,
  sessionRepository,
  sessionForAttendanceSheetRepository,
}) {
  const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(userId, sessionId);
  if (!hasMembership) {
    throw new UserNotAuthorizedToAccessEntityError('User is not allowed to access session.');
  }

  const session = await sessionForAttendanceSheetRepository.getWithCertificationCandidates(sessionId);
  const odsFilePath = _getAttendanceSheetTemplatePath(
    session.certificationCenterType,
    session.isOrganizationManagingStudents
  );

  const stringifiedXml = await readOdsUtils.getContentXml({
    odsFilePath,
  });

  const updatedStringifiedXml = _updateXmlWithSession(stringifiedXml, session);

  return writeOdsUtils.makeUpdatedOdsByContentXml({
    stringifiedXml: updatedStringifiedXml,
    odsFilePath,
  });
}

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

function _getAttendanceSheetTemplatePath(certificationCenterType, isOrganizationManagingStudents) {
  const templatePath = __dirname + '/../../infrastructure/files/attendance-sheet';
  if (certificationCenterType === 'SCO' && isOrganizationManagingStudents) {
    return `${templatePath}/sco_attendance_sheet_template.ods`;
  }
  return `${templatePath}/non_sco_attendance_sheet_template.ods`;
}
