const databaseBuffer = require('../database-buffer');
const { normalizeAndSortChars } = require('../../../lib/infrastructure/utils/string-utils');

module.exports = function buildCertificationCpfCountry({
  id = databaseBuffer.getNextId(),
  code = '99123',
  commonName = 'FILÉKISTANIE',
  originalName = 'RÉPUBLIQUE DE FILÉKISTAN',
  matcher = normalizeAndSortChars(originalName),
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
