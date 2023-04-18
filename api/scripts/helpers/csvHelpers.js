const fs = require('fs');
const { readFile, access } = require('fs').promises;
const { difference, isEmpty } = require('lodash');
const papa = require('papaparse');

const { NotFoundError, FileValidationError } = require('../../lib/domain/errors');
const { UnprocessableEntityError } = require('../../lib/application/http-errors');

const ERRORS = {
  INVALID_FILE_EXTENSION: 'INVALID_FILE_EXTENSION',
  MISSING_REQUIRED_FIELD_NAMES: 'MISSING_REQUIRED_FIELD_NAMES',
  MISSING_REQUIRED_FIELD_VALUES: 'MISSING_REQUIRED_FIELD_VALUES',
  EMPTY_FILE: 'EMPTY_FILE',
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
    if (columnName === 'credit' && isEmpty(value)) {
      value = 0;
    }
    if (columnName === 'locale' && isEmpty(value)) {
      value = 'fr-fr';
    }
    if (columnName === 'email' && !isEmpty(value)) {
      value = value.replaceAll(' ', '').toLowerCase();
    }
    return value;
  },
};

async function checkCsvHeader({ filePath, requiredFieldNames = [] }) {
  if (isEmpty(requiredFieldNames)) {
    throw new FileValidationError(ERRORS.MISSING_REQUIRED_FIELD_NAMES);
  }

  const data = await parseCsv(filePath, { skipEmptyLines: true, header: true, preview: 1 });
  if (isEmpty(data)) {
    throw new FileValidationError(ERRORS.EMPTY_FILE, 'File is empty');
  }

  const fieldNames = Object.keys(data[0]);

  const fieldNamesNotPresent = difference(requiredFieldNames, fieldNames);

  if (!isEmpty(fieldNamesNotPresent)) {
    throw new FileValidationError(ERRORS.MISSING_REQUIRED_FIELD_NAMES, `Headers missing: ${fieldNamesNotPresent}`);
  }
}

async function readCsvFile(filePath) {
  try {
    await access(filePath, fs.constants.F_OK);
  } catch (err) {
    throw new NotFoundError(`File ${filePath} not found!`);
  }

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

async function parseCsvWithHeader(filePath, options = optionsWithHeader) {
  const parsedCsvData = await parseCsv(filePath, options);
  if (parsedCsvData.length === 0) {
    throw new UnprocessableEntityError('No session data in csv', 'CSV_DATA_REQUIRED');
  }

  return parsedCsvData;
}

async function parseCsvWithHeaderAndRequiredFields({ filePath, requiredFieldNames }) {
  const csvData = [];

  const stepFunction = (results, parser) => {
    requiredFieldNames.forEach((requiredFieldName) => {
      if (!results.data[requiredFieldName]) {
        parser.abort();
        throw new FileValidationError(
          ERRORS.MISSING_REQUIRED_FIELD_VALUES,
          `Field values are required for ${requiredFieldName}`
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
  checkCsvHeader,
  readCsvFile,
  parseCsvData,
  parseCsv,
  parseCsvWithHeader,
  parseCsvWithHeaderAndRequiredFields,
  optionsWithHeader,
};
