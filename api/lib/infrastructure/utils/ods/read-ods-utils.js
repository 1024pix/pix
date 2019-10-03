const { UnprocessableEntityError } = require('../../errors');
const { loadOdsZip } = require('./common-ods-utils');
const _ = require('lodash');
const XLSX = require('xlsx');

const CONTENT_XML_IN_ODS = 'content.xml';

async function getContentXml({ odsFilePath }) {
  const zip = await loadOdsZip(odsFilePath);
  const contentXmlBufferCompressed = zip.file(CONTENT_XML_IN_ODS);
  const uncompressedBuffer = await contentXmlBufferCompressed.async('nodebuffer');
  return Buffer.from(uncompressedBuffer, 'utf8').toString();
}

async function extractTableDataFromOdsFile({ odsBuffer, tableHeaderTargetPropertyMap }) {
  const sheetDataRows = await _getSheetDataRowsFromOdsBuffer(odsBuffer);
  const sheetHeaderRow = _getHeaderRow(sheetDataRows, tableHeaderTargetPropertyMap);
  const sheetDataRowsBelowHeader = _extractRowsBelowHeader(sheetHeaderRow, sheetDataRows);
  const sheetHeaderPropertyMap = _mapSheetHeadersWithProperties(sheetHeaderRow, tableHeaderTargetPropertyMap);

  const data = _transformSheetDataRows(sheetDataRowsBelowHeader, sheetHeaderPropertyMap);
  if (_.isEmpty(data)) {
    throw new UnprocessableEntityError('No data in table');
  }
  return data;
}

async function _getSheetDataRowsFromOdsBuffer(odsBuffer) {
  let document;
  try {
    document = await XLSX.read(odsBuffer, { type: 'buffer', cellDates: true, });
  } catch (error) {
    throw new UnprocessableEntityError(error);
  }
  const sheet = document.Sheets[document.SheetNames[0]];
  const sheetDataRows = XLSX.utils.sheet_to_json(sheet, { header: 'A' });
  if (_.isEmpty(sheetDataRows)) {
    throw new UnprocessableEntityError('Empty data in sheet');
  }
  return sheetDataRows;
}

function _extractRowsBelowHeader(sheetHeaderRow, sheetDataRows) {
  const headerIndex = _.findIndex(sheetDataRows, (row) => _.isEqual(row, sheetHeaderRow));
  return _takeRightUntilIndex({ array: sheetDataRows, index: headerIndex + 1 });
}

function _takeRightUntilIndex({ array, index }) {
  const countElementsToTake = _.size(array) - index;
  return _.takeRight(array, countElementsToTake);
}

function _getHeaderRow(sheetDataRows, tableHeaderTargetPropertyMap) {
  const headers = _.map(tableHeaderTargetPropertyMap, (item) => item.header);
  const sheetHeaderRow = _.find(sheetDataRows, (row) => _allHeadersValuesAreInTheRow(row, headers));
  if (!sheetHeaderRow) {
    throw new UnprocessableEntityError('Table headers not found');
  }
  return sheetHeaderRow;
}

function _allHeadersValuesAreInTheRow(row, headers) {
  const cellValuesInRow = _.values(row);
  const headersInRow = _.intersection(cellValuesInRow, headers);
  return headersInRow.length === headers.length;
}

function _mapSheetHeadersWithProperties(sheetHeaderRow, tableHeaderTargetPropertyMap) {
  return _(sheetHeaderRow)
    .map(_addTargetDatas(tableHeaderTargetPropertyMap))
    .compact()
    .value();
}

function _addTargetDatas(tableHeaderTargetPropertyMap) {
  return (header, columnName) => {
    const targetProperties = _.find(tableHeaderTargetPropertyMap, { header });
    if (targetProperties) {
      const { property: targetProperty, transformFn } = targetProperties;
      return { columnName, targetProperty, transformFn };
    }
  };
}

function _transformSheetDataRows(sheetDataRows, sheetHeaderPropertyMap) {
  return _.map(sheetDataRows, (sheetDataRow) => _transformSheetDataRow(sheetDataRow, sheetHeaderPropertyMap));
}

function _transformSheetDataRow(sheetDataRow, sheetHeaderPropertyMap) {
  return _.reduce(sheetHeaderPropertyMap, (target, { columnName, targetProperty, transformFn }) => {
    const cellValue = sheetDataRow[columnName];
    target[targetProperty] = transformFn(cellValue);
    return target;
  }, {});
}

module.exports = {
  getContentXml,
  extractTableDataFromOdsFile,
};
