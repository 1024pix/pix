const odsContentXmlService = require('./../../infrastructure/services/ods-content-xml-service');
// Placeholder in the template ODS file that helps us find the template candidate row in the file.
const CANDIDATE_ROW_MARKER_PLACEHOLDER = 'COUNT';

function getUpdatedXmlWithSessionData({ stringifiedXml, sessionTemplateValues, sessionData }) {
  return odsContentXmlService.updateXmlSparseValues({
    stringifiedXml,
    templateValues: sessionTemplateValues,
    dataToInject: sessionData,
  });
}

function getUpdatedXmlWithCertificationCandidatesData({ stringifiedXml, candidateTemplateValues, candidatesData }) {
  return odsContentXmlService.updateXmlRows({
    stringifiedXml,
    rowMarkerPlaceholder: CANDIDATE_ROW_MARKER_PLACEHOLDER,
    rowTemplateValues: candidateTemplateValues,
    dataToInject: candidatesData,
  });
}

module.exports = {
  getUpdatedXmlWithSessionData,
  getUpdatedXmlWithCertificationCandidatesData,
};
