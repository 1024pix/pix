const fs = require('fs');
const path = require('path');
const papa = require('papaparse');

const { NotFoundError, FileValidationError } = require('../../lib/domain/errors');

const optionsWithHeader = {
  skipEmptyLines: true,
  header: true,
  transform: (value, columnName) => {
    if (columnName === 'uai') {
      value = value.toUpperCase().trim();
    }
    return value;
  }
};

function checkCsvExtensionFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new NotFoundError(`File ${filePath} not found!`);
  }

  const fileExtension = path.extname(filePath);

  if (fileExtension !== '.csv') {
    throw new FileValidationError(`File with extension ${fileExtension} not supported!`);
  }

  return true;
}

function parseCsv(filePath, options) {
  checkCsvExtensionFile(filePath);
  const rawData = fs.readFileSync(filePath, 'utf8');
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
  parseCsvWithHeader
};
