const writeOdsUtils = require('../../infrastructure/utils/ods/write-ods-utils');
const readOdsUtils = require('../../infrastructure/utils/ods/read-ods-utils');
const sessionXmlService = require('../services/session-xml-service');
const { UserNotAuthorizedToAccessEntity } = require('../errors');
const {
  EXTRA_EMPTY_CANDIDATE_ROWS,
  IMPORT_CANDIDATES_TEMPLATE_VALUES,
  IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES,
} = require('../../infrastructure/files/candidates-import/candidates-import-placeholders');
const moment = require('moment');
const _ = require('lodash');

module.exports = async function getCandidatesImportSheet({ userId, sessionId, sessionRepository }) {

  const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(userId, sessionId);
  if (!hasMembership) {
    throw new UserNotAuthorizedToAccessEntity('User is not allowed to access session.');
  }

  const [ stringifiedXml, session ] = await Promise.all([
    readOdsUtils.getContentXml({ odsFilePath: _getCandidatesImportTemplatePath() }),
    sessionRepository.getWithCertificationCandidates(sessionId),
  ]);

  const updatedStringifiedXml = _updateXmlWithSession(stringifiedXml, session);

  return writeOdsUtils.makeUpdatedOdsByContentXml({ stringifiedXml: updatedStringifiedXml, odsFilePath: _getCandidatesImportTemplatePath() });
};

function _updateXmlWithSession(stringifiedXml, session) {
  const sessionData = _.transform(session, _transformSessionIntoCandidatesImportSheetSessionData);
  const updatedStringifiedXml = sessionXmlService.getUpdatedXmlWithSessionData({
    stringifiedXml,
    sessionData,
    sessionTemplateValues: IMPORT_CANDIDATES_SESSION_TEMPLATE_VALUES,
  });

  return _updateXmlWithCertificationCandidates(updatedStringifiedXml, session.certificationCandidates);
}

function _updateXmlWithCertificationCandidates(stringifiedXml, certificationCandidates) {
  const candidatesData = _.map(certificationCandidates, (candidate, index) => {
    const candidateData = _.transform(candidate, _transformCandidateIntoCandidatesImportSheetData);
    candidateData.count = index + 1;
    return candidateData;
  });
  _.times(EXTRA_EMPTY_CANDIDATE_ROWS, () => {
    const emptyCandidateData = {};
    _.each(IMPORT_CANDIDATES_TEMPLATE_VALUES, (templateVal) => {
      emptyCandidateData[templateVal.propertyName] = '';
    });
    emptyCandidateData.count = candidatesData.length + 1;
    candidatesData.push(emptyCandidateData);
  });

  return sessionXmlService.getUpdatedXmlWithCertificationCandidatesData({
    stringifiedXml,
    candidatesData,
    candidateTemplateValues: IMPORT_CANDIDATES_TEMPLATE_VALUES,
  });
}

function _transformSessionIntoCandidatesImportSheetSessionData(attendanceSheetData, value, prop) {
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

function _transformCandidateIntoCandidatesImportSheetData(attendanceSheetData, value, prop) {
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

function _getCandidatesImportTemplatePath() {
  return __dirname + '/../../infrastructure/files/candidates-import/candidates_import_template.ods';
}
