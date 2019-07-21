const util = require('util');
const fs = require('fs');
const JSZip = require('jszip');
const XLSX = require('xlsx');
const _ = require('lodash');
const { ODSBufferReadFailedError, ODSTableDataEmptyError, ODSTableHeadersNotFoundError, ODSInvalidDataError } = require('../../domain/errors');

const CONTENT_XML_IN_ODS = 'content.xml';

module.exports = {
  getContentXml,
  makeUpdatedOdsByContentXml,
  extractTableDataFromOdsFile,
};

async function getContentXml({ odsFilePath }) {
  const zip = await _loadOdsTemplate(odsFilePath);
  const contentXmlBufferCompressed = zip.file(CONTENT_XML_IN_ODS);
  const uncompressedBuffer = await contentXmlBufferCompressed.async('nodebuffer');
  return Buffer.from(uncompressedBuffer, 'utf8').toString();
}

async function makeUpdatedOdsByContentXml({ stringifiedXml, odsFilePath }) {
  const zip = await _loadOdsTemplate(odsFilePath);
  await zip.file(CONTENT_XML_IN_ODS, stringifiedXml);
  const odsBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  return odsBuffer;
}

async function extractTableDataFromOdsFile({ odsBuffer, tableHeaderPropertyMap }) {
  let document;
  try {
    document = await XLSX.read(odsBuffer, { type: 'buffer', cellDates: true, });
  } catch (error) {
    throw new ODSBufferReadFailedError(error);
  }
  const sheet = document.Sheets[document.SheetNames[0]];
  const JSONSheet = XLSX.utils.sheet_to_json(sheet);
  if (_.isEmpty(JSONSheet))
  {
    throw new ODSInvalidDataError();
  }

  let sheetHeaderPropertyMap, JSONDataTable;
  try {
    [
      sheetHeaderPropertyMap,
      JSONDataTable,
    ] = _getJSONDataTable(JSONSheet, tableHeaderPropertyMap);
  }
  catch (error) {
    throw (error);
  }
  const data = _parseJSONDataTable(JSONDataTable, sheetHeaderPropertyMap);
  if (_.size(data) === 0)
  {
    throw new ODSTableDataEmptyError();
  }

  return data;
}

async function _loadOdsTemplate(odsFilePath) {
  const odsFileData = await _openOdsFile(odsFilePath);
  const zip = JSZip();
  return await zip.loadAsync(odsFileData);
}

async function _openOdsFile(odsFilePath) {
  return await util.promisify(fs.readFile)(odsFilePath);
}

function _getJSONDataTable(JSONSheet, tableHeaderPropertyMap) {
  const headers = _.map(tableHeaderPropertyMap, (item) => item.header);
  const headersRowIndexInSheet = _.findIndex(JSONSheet, (JSONRow) => {
    return _isRowHeader(JSONRow, headers);
  });
  if (headersRowIndexInSheet === -1) {
    throw new ODSTableHeadersNotFoundError();
  }

  const JSONHeaderRow = JSONSheet[headersRowIndexInSheet];
  const sheetHeaderPropertyMap = _mapSheetHeadersWithProperties(JSONHeaderRow, tableHeaderPropertyMap);
  const JSONDataTable = _takeRightUntilIndex({ array: JSONSheet, index: headersRowIndexInSheet + 1 });
  return [
    sheetHeaderPropertyMap,
    JSONDataTable,
  ];
}

function _isRowHeader(JSONRow, headers) {
  const rowColumns = _.map(JSONRow, (value) => value);
  const intersection = _.intersection(rowColumns, headers);
  return _.size(_.difference(headers, intersection)) === 0;
}

function _mapSheetHeadersWithProperties(JSONHeaderRow, tableHeaderPropertyMap) {
  const sheetHeaderPropertyMap = [];
  _.each(JSONHeaderRow, (columnName, headerLabel) => {
    const colIndex = _.findIndex(tableHeaderPropertyMap, (column_property) => column_property.header === columnName);
    if (colIndex !== -1)
    {
      sheetHeaderPropertyMap.push({ header: headerLabel, property: tableHeaderPropertyMap[colIndex].property });
    }
  });

  return sheetHeaderPropertyMap;
}

function _takeRightUntilIndex({ array, index }) {
  const countElementsToTake = _.size(array) - index;
  return _.takeRight(array, countElementsToTake);
}

function _parseJSONDataTable(JSONDataTable, sheetHeaderPropertyMap) {
  const data = [];
  _.each(JSONDataTable, (JSONRow) => {
    const itemData = {};
    _.each(sheetHeaderPropertyMap, (headerProperty) => {
      const header = headerProperty.header;
      const property = headerProperty.property;
      let value = _.isUndefined(JSONRow[header]) ? null : JSONRow[header];
      value = value === '' ? null : value;
      itemData[property] = value;
    });
    data.push(itemData);
  });

  return data;
}
