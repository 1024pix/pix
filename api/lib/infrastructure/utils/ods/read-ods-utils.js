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
  const tableHeaders = _.map(tableHeaderTargetPropertyMap, 'header');
  const sheetHeaderRow = _findHeaderRow(sheetDataRows, tableHeaders);
  if (!sheetHeaderRow) {
    throw new UnprocessableEntityError('Table headers not found');
  }
  const sheetDataRowsBelowHeader = _extractRowsBelowHeader(sheetHeaderRow, sheetDataRows);
  const sheetHeaderPropertyMap = _mapSheetHeadersWithProperties(sheetHeaderRow, tableHeaderTargetPropertyMap);

  const data = _transformSheetDataRows(sheetDataRowsBelowHeader, sheetHeaderPropertyMap);
  if (_.isEmpty(data)) {
    throw new UnprocessableEntityError('No data in table');
  }
  return data;
}

async function getOdsVersionByHeaders({ odsBuffer, transformationStructsByVersion }) {
  const sheetDataRows = await _getSheetDataRowsFromOdsBuffer(odsBuffer);
  let version = null;
  _.some(transformationStructsByVersion, (transformationStruct) => {
    const sheetHeaderRow = _findHeaderRow(sheetDataRows, transformationStruct.headers);
    if (sheetHeaderRow) {
      version = transformationStruct.version;
      return true;
    }
  });

  if (version) {
    return version;
  }

  throw new UnprocessableEntityError('Unknown attendance sheet version');
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

function _findHeaderRow(sheetDataRows, tableHeaders) {
  return _.find(sheetDataRows, (row) => _allHeadersValuesAreInTheRow(row, tableHeaders));
}

function _allHeadersValuesAreInTheRow(row, headers) {
  const cellValuesInRow = _.values(row);
  const strippedCellValuesInRow = _.map(cellValuesInRow, _removeNewlineCharactersFromHeader);
  const strippedHeaders = _.map(headers, _removeNewlineCharactersFromHeader);
  const headersInRow = _.intersection(strippedCellValuesInRow, strippedHeaders);
  return headersInRow.length === headers.length;
}

function _removeNewlineCharactersFromHeader(header) {
  return _.isString(header) ? header.replace(/[\n\r]/g, '') : header;
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
  getOdsVersionByHeaders,
};
