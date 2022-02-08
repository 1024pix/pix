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

  const { referenceRowElement, rowsContainerElement } = _getRefRowAndContainerDomElements(
    parsedXmlDom,
    rowMarkerPlaceholder
  );

  const cloneRowElement = _deepCloneDomElement(referenceRowElement);
  rowsContainerElement.removeChild(referenceRowElement);

  _.each(dataToInject, (rowDataToInject) => {
    const currentCloneRowElement = _deepCloneDomElement(cloneRowElement);
    _updateXmlElementWithData(currentCloneRowElement, rowDataToInject, rowTemplateValues);
    rowsContainerElement.appendChild(currentCloneRowElement);
  });

  return _buildStringifiedXmlFromXmlDom(parsedXmlDom);
}

function incrementRowsColumnSpan({ stringifiedXml, startLine, endLine, increment }) {
  const parsedXmlDom = _buildXmlDomFromXmlString(stringifiedXml);
  const rows = Array.from(parsedXmlDom.getElementsByTagName('table:table-row'));

  for (let i = startLine; i <= endLine; i++) {
    const element = Array.from(rows[i].getElementsByTagName('table:table-cell'))
      .reverse()
      .find((element) => element.hasAttribute('table:number-columns-spanned'));
    if (element) {
      element.setAttribute(
        'table:number-columns-spanned',
        parseInt(element.getAttribute('table:number-columns-spanned')) + increment
      );
    }
  }

  return _buildStringifiedXmlFromXmlDom(parsedXmlDom);
}

function addCellToEndOfLineWithStyleOfCellLabelled({ stringifiedXml, lineNumber, cellToCopyLabel, addedCellOption }) {
  const parsedXmlDom = _buildXmlDomFromXmlString(stringifiedXml);
  const cellToCopy = _getXmlDomElementByText(parsedXmlDom, cellToCopyLabel).parentNode;
  const clonedCell = _deepCloneDomElement(cellToCopy);

  _updateCellTextContent({ clonedCell, textContent: addedCellOption.labels });

  if (addedCellOption.rowspan) {
    clonedCell.setAttribute('table:number-rows-spanned', addedCellOption.rowspan);
  }
  if (addedCellOption.colspan) {
    clonedCell.setAttribute('table:number-columns-spanned', addedCellOption.colspan);
  }

  const addedCellPositionOffset = addedCellOption.positionOffset ? addedCellOption.positionOffset : 1;
  _addCellToEndOfLine({
    parsedXmlDom,
    lineNumber,
    cell: clonedCell,
    positionOffset: addedCellPositionOffset,
  });

  if (addedCellOption.colspan && addedCellOption.colspan > 0) {
    const coveredTableCell = parsedXmlDom.createElement('table:covered-table-cell');
    coveredTableCell.setAttribute('table:number-columns-repeated', addedCellOption.colspan - 1);
    const coveredTableCellPositionOffset = addedCellOption.positionOffset ? addedCellOption.positionOffset : 1;
    _addCellToEndOfLine({
      parsedXmlDom,
      lineNumber,
      cell: coveredTableCell,
      positionOffset: coveredTableCellPositionOffset,
    });
  }

  return _buildStringifiedXmlFromXmlDom(parsedXmlDom);
}

function _updateCellTextContent({ clonedCell, textContent }) {
  const textNode = clonedCell.getElementsByTagName('text:p').item(0);
  _updateStringXmlElement(textNode.childNodes.item(0), textContent[0]);
  for (let i = 1; i < textContent.length; i++) {
    const clonedTextNode = _deepCloneDomElement(textNode);
    _updateStringXmlElement(clonedTextNode.childNodes.item(0), textContent[i]);
    clonedCell.appendChild(clonedTextNode);
  }
}

function _addCellToEndOfLine({ parsedXmlDom, lineNumber, cell, positionOffset }) {
  const line = Array.from(parsedXmlDom.getElementsByTagName('table:table-row'))[lineNumber];
  const lineChildNodes = Array.from(line.childNodes);
  line.insertBefore(cell, lineChildNodes[lineChildNodes.length - positionOffset]);
}

function addValidatorRestrictedList({ stringifiedXml, validatorName, restrictedList, allowEmptyCell = true }) {
  const parsedXmlDom = _buildXmlDomFromXmlString(stringifiedXml);
  const contentValidations = parsedXmlDom.getElementsByTagName('table:content-validations').item(0);
  const validator = parsedXmlDom.createElement('table:content-validation');
  validator.setAttribute('table:name', validatorName);
  validator.setAttribute(
    'table:condition',
    `of:cell-content-is-in-list(${restrictedList.map((val) => `"${val}"`).join(';')})`
  );
  validator.setAttribute('table:allow-empty-cell', allowEmptyCell);

  const errorMessage = parsedXmlDom.createElement('table:error-message');
  errorMessage.setAttribute('table:display', 'true');
  errorMessage.setAttribute('table:message-type', 'stop');

  validator.appendChild(errorMessage);
  contentValidations.appendChild(validator);

  return _buildStringifiedXmlFromXmlDom(parsedXmlDom);
}

function addTooltipOnCell({ stringifiedXml, targetCellAddress, tooltipName, tooltipTitle, tooltipContentLines }) {
  const parsedXmlDom = _buildXmlDomFromXmlString(stringifiedXml);
  const contentValidations = parsedXmlDom.getElementsByTagName('table:content-validations').item(0);

  const tooltip = parsedXmlDom.createElement('table:content-validation');
  tooltip.setAttribute('table:name', tooltipName);
  tooltip.setAttribute('table:base-cell-address', targetCellAddress);

  const helpMessage = parsedXmlDom.createElement('table:help-message');
  helpMessage.setAttribute('table:title', tooltipTitle);
  helpMessage.setAttribute('table:display', 'true');

  const helpMessageWithContent = tooltipContentLines.reduce((helpMessageAccumulator, line) => {
    const paragraph = parsedXmlDom.createElement('text:p');
    paragraph.textContent = line;
    helpMessageAccumulator.appendChild(paragraph);
    return helpMessageAccumulator;
  }, helpMessage);

  tooltip.appendChild(helpMessageWithContent);
  contentValidations.appendChild(tooltip);

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
  for (const { placeholder, propertyName, validator } of templateValues) {
    const targetXmlDomElement = _getXmlDomElementByText(xmlElement, placeholder);
    if (targetXmlDomElement) {
      _updateXmlElementByType(
        targetXmlDomElement.parentNode,
        targetXmlDomElement,
        dataToInject[propertyName],
        validator
      );
    }
  }
}

function _updateXmlElementByType(xmlElement, xmlElementTextChild, data, validator) {
  if (validator) {
    xmlElement.setAttribute('table:content-validation-name', validator);
  }

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
  addCellToEndOfLineWithStyleOfCellLabelled,
  incrementRowsColumnSpan,
  addValidatorRestrictedList,
  addTooltipOnCell,
};
