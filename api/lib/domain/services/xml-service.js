const { DOMParser, XMLSerializer } = require('xmldom');

module.exports = {
  getUpdatedXml
};

function getUpdatedXml({ stringifiedXml, templateValues, dataToInject }) {
  const parsedXmlDom = _buildXmlDomFromXmlString(stringifiedXml);
  const updatedXmlDom = _updatedXmlDomWithSessionData(parsedXmlDom, dataToInject, templateValues);
  return _buildStringifiedXmlFromXmlDom(updatedXmlDom);
};

function _buildXmlDomFromXmlString(stringifiedXml) {
  return new DOMParser().parseFromString(stringifiedXml);
}

function _updatedXmlDomWithSessionData(parsedXmlDom, dataToInject, templateValues) {
  for (const templateValue of templateValues) {
    const targetXmlDomElement = _getXmlDomElementByText(parsedXmlDom, templateValue.placeholder);
    if (targetXmlDomElement) {
      const newXmlValue = dataToInject[templateValue.propertyName];
      targetXmlDomElement.textContent = newXmlValue;
    }
  }
  return parsedXmlDom;
}

function _getXmlDomElementByText(parsedXmlDom, text) {
  for (const xmlDomElement of Array.from(parsedXmlDom.getElementsByTagName('text:p'))) {
    if (xmlDomElement.textContent === text) {
      return xmlDomElement;
    }
  }
}

function _buildStringifiedXmlFromXmlDom(parsedXmlDom) {
  return new XMLSerializer().serializeToString(parsedXmlDom);
}
