const fs = require('fs');
const { readFile, access } = require('fs').promises;
const path = require('path');
const { difference, isEmpty, isNumber } = require('lodash');
const papa = require('papaparse');

const { NotFoundError, FileValidationError } = require('../../lib/domain/errors');
const ERRORS = {
  INVALID_FILE_EXTENSION: 'INVALID_FILE_EXTENSION',
  MISSING_REQUIRED_FIELD_NAMES: 'MISSING_REQUIRED_FIELD_NAMES',
  MISSING_REQUIRED_FIELD_VALUES: 'MISSING_REQUIRED_FIELD_VALUES',
};

const optionsWithHeader = {
  skipEmptyLines: true,
  header: true,
  transform: (value, columnName) => {
    if (typeof value === 'string') {
      value = value.trim();
    }
    if (columnName === 'uai') {
      value = value.toUpperCase();
    }
    if (columnName === 'createdBy') {
      value = !isEmpty(value) && parseInt(value, 10);
    }
    return value;
  },
};

function checkCsvExtensionFile(filePath) {
  const fileExtension = path.extname(filePath);

  if (fileExtension !== '.csv') {
    throw new FileValidationError(ERRORS.INVALID_FILE_EXTENSION, { fileExtension });
  }
}

async function checkCsvHeader({ filePath, requiredFieldNames = [] }) {
  if (isEmpty(requiredFieldNames)) {
    throw new FileValidationError(ERRORS.MISSING_REQUIRED_FIELD_NAMES);
  }

  const options = { ...optionsWithHeader, preview: 1 };
  const data = await parseCsv(filePath, options);
  const fieldNames = Object.keys(data[0]);

  const fieldNamesNotPresent = difference(requiredFieldNames, fieldNames);

  if (!isEmpty(fieldNamesNotPresent)) {
    throw new FileValidationError(ERRORS.MISSING_REQUIRED_FIELD_NAMES, `Header are required: ${requiredFieldNames}`);
  }
}

async function readCsvFile(filePath) {
  try {
    await access(filePath, fs.constants.F_OK);
  } catch (err) {
    throw new NotFoundError(`File ${filePath} not found!`);
  }
  checkCsvExtensionFile(filePath);

  const rawData = await readFile(filePath, 'utf8');
  return rawData.replace(/^\uFEFF/, '');
}

async function parseCsv(filePath, options) {
  const cleanedData = await readCsvFile(filePath);
  return parseCsvData(cleanedData, options);
}

async function parseCsvData(cleanedData, options) {
  const { data } = papa.parse(cleanedData, options);

  return data;
}

function parseCsvWithHeader(filePath) {
  return parseCsv(filePath, optionsWithHeader);
}

async function parseCsvWithHeaderAndRequiredFields({ filePath, requiredFieldNames }) {
  const csvData = [];

  const stepFunction = (results, parser) => {
    requiredFieldNames.forEach((fieldName) => {
      if (!isNumber(results.data[fieldName])) {
        parser.abort();
        throw new FileValidationError(
          ERRORS.MISSING_REQUIRED_FIELD_VALUES,
          `Field values are required: ${requiredFieldNames}`
        );
      }
    });
    csvData.push(results.data);
  };
  const options = { ...optionsWithHeader, step: stepFunction };

  await parseCsv(filePath, options);

  return csvData;
}

module.exports = {
  checkCsvExtensionFile,
  checkCsvHeader,
  readCsvFile,
  parseCsvData,
  parseCsv,
  parseCsvWithHeader,
  parseCsvWithHeaderAndRequiredFields,
};
