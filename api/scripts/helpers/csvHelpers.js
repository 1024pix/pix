import fs from 'node:fs';

import lodash from 'lodash';
import papa from 'papaparse';

import { FileValidationError, NotFoundError } from '../../src/shared/domain/errors.js';

const { difference, isEmpty } = lodash;

const { promises } = fs;

const { readFile, access } = promises;

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
    const trimmedValue = typeof value === 'string' ? value.trim() : value;
    if (columnName === 'uai') {
      return trimmedValue.toUpperCase();
    }
    if (columnName === 'createdBy') {
      return !isEmpty(trimmedValue) && parseInt(trimmedValue, 10);
    }
    if (columnName === 'credit' && isEmpty(trimmedValue)) {
      return 0;
    }
    if (columnName === 'locale' && isEmpty(trimmedValue)) {
      return 'fr-fr';
    }
    if (columnName === 'email' && !isEmpty(trimmedValue)) {
      return trimmedValue.replaceAll(' ', '').toLowerCase();
    }
    return trimmedValue;
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
  } catch {
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
  return await parseCsv(filePath, options);
}

async function parseCsvWithHeaderAndRequiredFields({ filePath, requiredFieldNames }) {
  const csvData = [];

  const stepFunction = (results, parser) => {
    requiredFieldNames.forEach((requiredFieldName) => {
      if (!results.data[requiredFieldName]) {
        parser.abort();
        throw new FileValidationError(
          ERRORS.MISSING_REQUIRED_FIELD_VALUES,
          `Field values are required for ${requiredFieldName}`,
        );
      }
    });
    csvData.push(results.data);
  };
  const options = { ...optionsWithHeader, step: stepFunction };

  await parseCsv(filePath, options);

  return csvData;
}

export {
  checkCsvHeader,
  optionsWithHeader,
  parseCsv,
  parseCsvData,
  parseCsvWithHeader,
  parseCsvWithHeaderAndRequiredFields,
  readCsvFile,
};
