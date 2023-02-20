import fs from 'fs';
import { promises } from 'fs';

const { readFile: readFile, access: access } = promises;

import { difference, isEmpty } from 'lodash';
import papa from 'papaparse';
import { NotFoundError, FileValidationError } from '../../lib/domain/errors';
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

function parseCsvWithHeader(filePath, options = optionsWithHeader) {
  return parseCsv(filePath, options);
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

export default {
  checkCsvHeader,
  readCsvFile,
  parseCsvData,
  parseCsv,
  parseCsvWithHeader,
  parseCsvWithHeaderAndRequiredFields,
  optionsWithHeader,
};
