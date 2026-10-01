import fs from 'node:fs';

const { promises } = fs;
const { readFile, access } = promises;

import papa from 'papaparse';

import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CsvWithNoSessionDataError } from '../../domain/errors.js';

const optionsWithHeader = {
  skipEmptyLines: true,
  header: true,
  transform: (value, columnName) => {
    const trimmedValue = typeof value === 'string' ? value.trim() : value;
    return columnName === '* Sexe (M ou F)' ? trimmedValue.toUpperCase() : trimmedValue;
  },
};

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

function parseCsvData(cleanedData, options) {
  const { data } = papa.parse(cleanedData, options);
  return data;
}

async function parseCsvWithHeader(filePath, options = optionsWithHeader) {
  const parsedCsvData = await parseCsv(filePath, options);
  if (parsedCsvData.length === 0) {
    throw new CsvWithNoSessionDataError();
  }

  return parsedCsvData;
}

export { parseCsv, parseCsvWithHeader, readCsvFile };
