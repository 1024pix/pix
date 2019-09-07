const util = require('util');
const fs = require('fs');
const JSZip = require('jszip');
const XLSX = require('xlsx');
const _ = require('lodash');
const { ODSBufferReadFailedError, ODSTableDataEmptyError, ODSTableHeadersNotFoundError } = require('../../domain/errors');

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
  const sheetDataRows = XLSX.utils.sheet_to_json(sheet, { header: 'A' });
  if (_.isEmpty(sheetDataRows)) {
    throw new ODSBufferReadFailedError('Empty data in sheet');
  }

  const sheetHeaderRow = _findHeaderRow(sheetDataRows, tableHeaderPropertyMap);
  if (!sheetHeaderRow) {
    throw new ODSTableHeadersNotFoundError();
  }
  const sheetHeaderPropertyMap = _mapSheetHeadersWithProperties(sheetHeaderRow, tableHeaderPropertyMap);
  const sheetDataExtractedRows = _extractRowsBelowHeader(sheetHeaderRow, sheetDataRows);

  const data = _transformSheetDataRows(sheetDataExtractedRows, sheetHeaderPropertyMap);
  if (_.isEmpty(data)) {
    throw new ODSTableDataEmptyError();
  }

  return data;
}

async function _loadOdsTemplate(odsFilePath) {
  const odsFileData = await _openOdsFile(odsFilePath);
  const zip = JSZip();
  return zip.loadAsync(odsFileData);
}

function _openOdsFile(odsFilePath) {
  return util.promisify(fs.readFile)(odsFilePath);
}

function _extractRowsBelowHeader(sheetHeaderRow, sheetDataRows) {
  const headerIndex = _.findIndex(sheetDataRows, (row) => _.isEqual(row, sheetHeaderRow));
  return _takeRightUntilIndex({ array: sheetDataRows, index: headerIndex + 1 });
}

function _findHeaderRow(sheetDataRows, tableHeaderPropertyMap) {
  const headers = _.map(tableHeaderPropertyMap, (item) => item.header);
  return _.find(sheetDataRows, (row) => _.isEqual(_.intersection(_.values(row), headers), headers));
}

function _mapSheetHeadersWithProperties(JSONHeaderRow, tableHeaderPropertyMap) {
  const sheetHeaderPropertyMap = [];
  _.each(JSONHeaderRow, (columnName, headerLabel) => {
    const colIndex = _.findIndex(tableHeaderPropertyMap, (column_property) => column_property.header === columnName);
    if (colIndex !== -1)
    {
      sheetHeaderPropertyMap.push({
        header: headerLabel,
        property: tableHeaderPropertyMap[colIndex].property,
        transformFn: tableHeaderPropertyMap[colIndex].transformFn,
      });
    }
  });

  return sheetHeaderPropertyMap;
}

function _takeRightUntilIndex({ array, index }) {
  const countElementsToTake = _.size(array) - index;
  return _.takeRight(array, countElementsToTake);
}

function _transformSheetDataRows(sheetDataRows, sheetHeaderPropertyMap) {
  return _.map(sheetDataRows, (JSONRow) => {
    return _.reduce(sheetHeaderPropertyMap, (acc, { header, property, transformFn }) => {
      acc[property] = transformFn(JSONRow[header]);
      return acc;
    }, {});
  });
}
