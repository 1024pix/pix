import { databaseBuffer } from '../database-buffer.js';
import { normalizeAndSortChars } from '../../../src/shared/infrastructure/utils/string-utils.js';

const buildCertificationCpfCountry = function ({
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

export { buildCertificationCpfCountry };
