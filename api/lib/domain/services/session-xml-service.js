import writeOdsUtils from '../../infrastructure/utils/ods/write-ods-utils';
// Placeholder in the template ODS file that helps us find the template candidate row in the file.
const CANDIDATE_ROW_MARKER_PLACEHOLDER = 'COUNT';

function getUpdatedXmlWithSessionData({ stringifiedXml, sessionTemplateValues, sessionData }) {
  return writeOdsUtils.updateXmlSparseValues({
    stringifiedXml,
    templateValues: sessionTemplateValues,
    dataToInject: sessionData,
  });
}

function getUpdatedXmlWithCertificationCandidatesData({ stringifiedXml, candidateTemplateValues, candidatesData }) {
  return writeOdsUtils.updateXmlRows({
    stringifiedXml,
    rowMarkerPlaceholder: CANDIDATE_ROW_MARKER_PLACEHOLDER,
    rowTemplateValues: candidateTemplateValues,
    dataToInject: candidatesData,
  });
}

export default {
  getUpdatedXmlWithSessionData,
  getUpdatedXmlWithCertificationCandidatesData,
};
