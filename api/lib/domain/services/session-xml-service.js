const writeOdsUtils = require('../../infrastructure/utils/ods/write-ods-utils');
// Placeholder in the template ODS file that helps us find the template candidate row in the file.

function getUpdatedXmlWithSessionData({ stringifiedXml, sessionTemplateValues, sessionData }) {
  return writeOdsUtils.updateXmlSparseValues({
    stringifiedXml,
    templateValues: sessionTemplateValues,
    dataToInject: sessionData,
  });
}

module.exports = {
  getUpdatedXmlWithSessionData,
};
