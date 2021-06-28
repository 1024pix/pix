const databaseBuffer = require('../database-buffer');
const { sanitizeAndSortChars } = require('../../../lib/infrastructure/utils/string-utils');

module.exports = function buildCertificationCpfCountry({
  id = databaseBuffer.getNextId(),
  code = '99123',
  commonName = 'FILÉKISTANIE',
  originalName = 'RÉPUBLIQUE DE FILÉKISTAN',
  matcher = sanitizeAndSortChars(originalName),
  createdAt = new Date(),
} = {}) {
  const values = {
    id,
    code,
    commonName,
    originalName,
    matcher,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-cpf-countries',
    values,
  });
};
