const { DOMParser, XMLSerializer } = require('xmldom');
const _ = require('lodash');
const moment = require('moment');

// This value is in the template attendance sheet. It helps us retrieve the template candidate row DOM element.
const CURRENT_ROW_MARKER_PLACEHOLDER = 'INCREMENT';

module.exports = {
  getUpdatedXmlWithSessionData,
  getUpdatedXmlWithCertificationCandidatesData,
};

function getUpdatedXmlWithSessionData({ stringifiedXml, templateValues, dataToInject }) {
  const parsedXmlDom = _buildXmlDomFromXmlString(stringifiedXml);
  _updateXmlDomWithSessionData(parsedXmlDom, dataToInject, templateValues);
  return _buildStringifiedXmlFromXmlDom(parsedXmlDom);
}

function getUpdatedXmlWithCertificationCandidatesData({ stringifiedXml, templateValues, candidatesDataToInject }) {
  const parsedXmlDom = _buildXmlDomFromXmlString(stringifiedXml);
  const {
    candidateRowDomElement,
    candidateRowDomElementNextSibling,
    candidateRowElementContainer,
  } = _getCandidateRowAndSiblingAndContainerDomElement(parsedXmlDom);
  const templateCandidateRowDomElement = _deepCloneDomElement(candidateRowDomElement);
  candidateRowElementContainer.removeChild(candidateRowDomElement);
  _.each(candidatesDataToInject, (candidateData) => {
    const currentCloneCandidateRowElement = _deepCloneDomElement(templateCandidateRowDomElement);
    _updateXmlElementWithCandidateData(currentCloneCandidateRowElement, candidateData, templateValues);
    candidateRowElementContainer.insertBefore(currentCloneCandidateRowElement, candidateRowDomElementNextSibling);
  });

  return _buildStringifiedXmlFromXmlDom(parsedXmlDom);
}

function _getCandidateRowAndSiblingAndContainerDomElement(parsedXmlDom) {
  const candidateRowDomElement = _getXmlDomElementByText(parsedXmlDom, CURRENT_ROW_MARKER_PLACEHOLDER).parentNode.parentNode;
  return {
    candidateRowDomElement,
    candidateRowDomElementNextSibling: candidateRowDomElement.nextSibling,
    candidateRowElementContainer: candidateRowDomElement.parentNode,
  };
}

function _buildXmlDomFromXmlString(stringifiedXml) {
  return new DOMParser().parseFromString(stringifiedXml);
}

function _deepCloneDomElement(domElement) {
  const isDeep = true;
  return domElement.cloneNode(isDeep);
}

function _updateXmlDomWithSessionData(parsedXmlDom, dataToInject, templateValues) {
  for (const templateValue of templateValues) {
    const targetXmlDomElement = _getXmlDomElementByText(parsedXmlDom, templateValue.placeholder);
    if (targetXmlDomElement) {
      const newXmlValue = dataToInject[templateValue.propertyName];
      targetXmlDomElement.textContent = newXmlValue;
    }
  }
}

function _updateXmlElementWithCandidateData(candidateXmlElement, dataToInject, templateValues) {
  _.each(templateValues, (templateValue) => {
    const fieldXmlElement = _getXmlDomElementByText(candidateXmlElement, templateValue.placeholder);
    if (fieldXmlElement) {
      const valueType = fieldXmlElement.parentNode.getAttribute('office:value-type');
      switch (valueType) {
        case 'string':
          _updateStringXmlElement(fieldXmlElement, dataToInject[templateValue.propertyName]);
          break;
        case 'date':
          _updateDateXmlElement(fieldXmlElement, dataToInject[templateValue.propertyName]);
          break;
        case 'float':
          _updateFloatXmlElement(fieldXmlElement, dataToInject[templateValue.propertyName]);
          break;
        default:
          break;
      }
    }
  });
}

function _updateStringXmlElement(xmlElement, data) {
  xmlElement.textContent = data;
}

function _updateDateXmlElement(xmlElement, data) {
  if (data === '') {
    xmlElement.parentNode.removeAttribute('office:date-value');
    xmlElement.parentNode.removeAttribute('office:value-type');
    xmlElement.parentNode.removeAttribute('calcext:value-type');
    xmlElement.textContent = data;
  }
  else {
    xmlElement.parentNode.setAttribute('office:date-value', data);
    xmlElement.textContent = moment(data, 'YYYY-MM-DD').format('DD/MM/YYYY');
  }
}

function _updateFloatXmlElement(xmlElement, data) {
  if (data === '') {
    xmlElement.parentNode.removeAttribute('office:value');
    xmlElement.parentNode.removeAttribute('office:value-type');
    xmlElement.parentNode.removeAttribute('calcext:value-type');
  }
  else {
    xmlElement.parentNode.setAttribute('office:value', data);
  }
  xmlElement.textContent = data;
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
