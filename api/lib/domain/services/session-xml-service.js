const xmlService = require('./xml-service');

function getUpdatedXmlWithSessionData({ stringifiedXml, sessionTemplateValues, sessionData }) {
  return xmlService.updateXmlSparseValues({
    stringifiedXml,
    templateValues: sessionTemplateValues,
    dataToInject: sessionData,
  });
}

module.exports = {
  getUpdatedXmlWithSessionData,
};
