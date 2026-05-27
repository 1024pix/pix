import fs, { promises } from 'node:fs';

const { readFile, access } = promises;

import difference from 'lodash/difference.js';
import isEmpty from 'lodash/isEmpty.js';
import papa from 'papaparse';

import { FileValidationError, NotFoundError } from '../../domain/errors.js';
import { logger } from '../utils/logger.js';

const ERRORS = {
  MISSING_REQUIRED_FIELD_NAMES: 'MISSING_REQUIRED_FIELD_NAMES',
  EMPTY_FILE: 'EMPTY_FILE',
};
const OPTIONS_WITH_HEADER = {
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

  const data = await _parseCsv(filePath, { skipEmptyLines: true, preview: 1 });
  if (isEmpty(data)) {
    throw new FileValidationError(ERRORS.EMPTY_FILE, 'Le fichier ne contient aucune donnée');
  }

  const fieldNames = data[0].map((fieldName) => fieldName?.trim());
  const missingRequiredFieldNames = difference(requiredFieldNames, fieldNames);

  if (!isEmpty(missingRequiredFieldNames)) {
    throw new FileValidationError(
      ERRORS.MISSING_REQUIRED_FIELD_NAMES,
      `Colonne(s) manquante(s) ou erronée(s) : ${missingRequiredFieldNames}`,
    );
  }
}

function parseCsvWithHeader(filePath, options = OPTIONS_WITH_HEADER) {
  return _parseCsv(filePath, options);
}

async function _parseCsv(filePath, options) {
  const cleanedData = await readCsvFile(filePath);
  return parseCsvData(cleanedData, options);
}

async function readCsvFile(filePath) {
  try {
    await access(filePath, fs.constants.F_OK);
  } catch {
    throw new NotFoundError(`Aucun fichier nommé ${filePath} n'a été trouvé !`);
  }

  const rawData = await readFile(filePath, 'utf8');

  return rawData.replace(/^\uFEFF/, '');
}

async function parseCsvData(cleanedData, options) {
  const { data } = papa.parse(cleanedData, options);
  return data;
}

async function streamCsv(options) {
  return papa.parse(papa.NODE_STREAM_INPUT, options);
}

function _csvFormulaEscapingPrefix(data) {
  const mayBeInterpretedAsFormula = /^[-@=+]/.test(data);
  return mayBeInterpretedAsFormula ? "'" : '';
}

function _csvSerializeValue(data) {
  if (typeof data === 'number') {
    return data.toString().replace(/\./, ',');
  } else if (typeof data === 'string') {
    if (/^[0-9-]+$/.test(data)) {
      return data;
    } else {
      return `"${_csvFormulaEscapingPrefix(data)}${data.replace(/"/g, '""')}"`;
    }
  } else {
    logger.error(`Unknown value type in _csvSerializeValue: ${typeof data}: ${data}`);
    return '""';
  }
}

function serializeLine(lineArray) {
  return lineArray.map(_csvSerializeValue).join(';') + '\n';
}

const csvHelper = { checkCsvHeader, parseCsvWithHeader, parseCsvData, readCsvFile };

export { checkCsvHeader, csvHelper, parseCsvData, parseCsvWithHeader, serializeLine, streamCsv };
