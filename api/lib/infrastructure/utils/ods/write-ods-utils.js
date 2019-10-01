const { loadOdsZip } = require('./common-ods-utils');
const { DOMParser, XMLSerializer } = require('xmldom');
const _ = require('lodash');

const CONTENT_XML_IN_ODS = 'content.xml';

async function makeUpdatedOdsByContentXml({ stringifiedXml, odsFilePath }) {
  const zip = await loadOdsZip(odsFilePath);
  await zip.file(CONTENT_XML_IN_ODS, stringifiedXml);
  const odsBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  return odsBuffer;
}

function updateXmlSparseValues({ stringifiedXml, templateValues, dataToInject }) {
  const parsedXmlDom = _buildXmlDomFromXmlString(stringifiedXml);
  const parsedXmlDomUpdated = _updateXmlDomWithData(parsedXmlDom, dataToInject, templateValues);
  return _buildStringifiedXmlFromXmlDom(parsedXmlDomUpdated);
}

function updateXmlRows({ stringifiedXml, rowMarkerPlaceholder, rowTemplateValues, dataToInject }) {
  const parsedXmlDom = _buildXmlDomFromXmlString(stringifiedXml);

  const {
    referenceRowElement,
    rowsContainerElement,
  } = _getRefRowAndContainerDomElements(parsedXmlDom, rowMarkerPlaceholder);

  const cloneRowElement = _deepCloneDomElement(referenceRowElement);
  rowsContainerElement.removeChild(referenceRowElement);

  _.each(dataToInject, (rowDataToInject) => {
    const currentCloneRowElement = _deepCloneDomElement(cloneRowElement);
    _updateXmlElementWithData(currentCloneRowElement, rowDataToInject, rowTemplateValues);
    rowsContainerElement.appendChild(currentCloneRowElement);
  });

  return _buildStringifiedXmlFromXmlDom(parsedXmlDom);
}

function _getRefRowAndContainerDomElements(parsedXmlDom, rowMarkerPlaceholder) {
  const referenceRowElement = _getXmlDomElementByText(parsedXmlDom, rowMarkerPlaceholder).parentNode.parentNode;
  return {
    referenceRowElement,
    rowsContainerElement: referenceRowElement.parentNode,
  };
}

function _deepCloneDomElement(domElement) {
  const isDeep = true;
  return domElement.cloneNode(isDeep);
}

function _buildXmlDomFromXmlString(stringifiedXml) {
  return new DOMParser().parseFromString(stringifiedXml);
}

function _updateXmlDomWithData(parsedXmlDom, dataToInject, templateValues) {
  const parsedXmlDomUpdated = _.cloneDeep(parsedXmlDom);
  for (const { placeholder, propertyName } of templateValues) {
    const targetXmlDomElement = _getXmlDomElementByText(parsedXmlDomUpdated, placeholder);
    if (targetXmlDomElement) {
      const newXmlValue = dataToInject[propertyName];
      targetXmlDomElement.textContent = newXmlValue;
    }
  }
  return parsedXmlDomUpdated;
}

function _updateXmlElementWithData(xmlElement, dataToInject, templateValues) {
  for (const { placeholder, propertyName } of templateValues) {
    const targetXmlDomElement = _getXmlDomElementByText(xmlElement, placeholder);
    if (targetXmlDomElement) {
      _updateXmlElementByType(targetXmlDomElement.parentNode, targetXmlDomElement, dataToInject[propertyName]);
    }
  }
}

function _updateXmlElementByType(xmlElement, xmlElementTextChild, data) {
  if (data === '') {
    _clearXmlElement(xmlElement, xmlElementTextChild);
    return;
  }
  const valueType = xmlElement.getAttribute('office:value-type');
  switch (valueType) {
    case 'date':
      _updateDateXmlElement(xmlElement, xmlElementTextChild, data);
      break;
    case 'percentage':
      _updatePercentageXmlElement(xmlElement, xmlElementTextChild, data);
      break;
    case 'string':
    default:
      _updateStringXmlElement(xmlElementTextChild, data);
      break;
  }
}

function _clearXmlElement(xmlElement, xmlElementTextChild) {
  xmlElement.removeChild(xmlElementTextChild);
  xmlElement.removeAttribute('office:value-type');
  xmlElement.removeAttribute('office:date-value');
  xmlElement.removeAttribute('calcext:value-type');
  xmlElement.removeAttribute('office:value');
}

function _updateStringXmlElement(xmlElementTextChild, data) {
  xmlElementTextChild.textContent = data;
}

function _updateDateXmlElement(xmlElement, xmlElementTextChild, data) {
  xmlElement.setAttribute('office:date-value', data);
  xmlElement.removeChild(xmlElementTextChild);
}

function _updatePercentageXmlElement(xmlElement, xmlElementTextChild, data) {
  xmlElement.setAttribute('office:value', data);
  xmlElement.removeChild(xmlElementTextChild);
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

module.exports = {
  makeUpdatedOdsByContentXml,
  updateXmlSparseValues,
  updateXmlRows,
};
