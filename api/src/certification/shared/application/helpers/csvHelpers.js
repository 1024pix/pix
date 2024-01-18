import fs from 'fs';

const { promises } = fs;
const { readFile, access } = promises;

import papa from 'papaparse';

import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CsvWithNoSessionDataError } from '../../../session/domain/errors.js';

const optionsWithHeader = {
  skipEmptyLines: true,
  header: true,
  transform: (value, columnName) => {
    if (typeof value === 'string') {
      value = value.trim();
    }
    if (columnName === '* Sexe (M ou F)') {
      value = value.toUpperCase();
    }
    return value;
  },
};

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

export { parseCsvWithHeader, parseCsv, readCsvFile };
