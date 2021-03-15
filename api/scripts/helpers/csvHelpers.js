const fs = require('fs');
const { readFile, access } = require('fs').promises;
const path = require('path');
const papa = require('papaparse');

const { NotFoundError, FileValidationError } = require('../../lib/domain/errors');
const ERRORS = {
  INVALID_FILE_EXTENSION: 'INVALID_FILE_EXTENSION',
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
    return value;
  },
};

async function checkCsvExtensionFile(filePath) {
  try {
    await access(filePath, fs.constants.F_OK);
  } catch (err) {
    throw new NotFoundError(`File ${filePath} not found!`);
  }

  const fileExtension = path.extname(filePath);

  if (fileExtension !== '.csv') {
    throw new FileValidationError(ERRORS.INVALID_FILE_EXTENSION, { fileExtension });
  }

  return true;
}

async function parseCsv(filePath, options) {
  await checkCsvExtensionFile(filePath);
  const rawData = await readFile(filePath, 'utf8');
  const cleanedData = rawData.toString('utf8').replace(/^\uFEFF/, '');
  const { data } = papa.parse(cleanedData, options);

  return data;
}

function parseCsvWithHeader(filePath) {
  return parseCsv(filePath, optionsWithHeader);
}

module.exports = {
  checkCsvExtensionFile,
  parseCsv,
  parseCsvWithHeader,
};
