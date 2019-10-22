const fs = require('fs');
const path = require('path');
const papa = require('papaparse');

const { NotFoundError, FileValidationError } = require('../../lib/domain/errors');

function assertFileValidity(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new NotFoundError(`File not found ${filePath}`);
  }

  const fileExtension = path.extname(filePath);

  if (fileExtension !== '.csv') {
    throw new FileValidationError(`File extension not supported ${fileExtension}`);
  }

  return true;
}

function parseCsv(filePath, options) {
  assertFileValidity(filePath);
  const rawData = fs.readFileSync(filePath, 'utf8');
  const { data } = papa.parse(rawData, options);

  return data;
}

module.exports = {
  assertFileValidity,
  parseCsv,
};
