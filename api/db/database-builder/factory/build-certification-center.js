import { databaseBuffer } from '../database-buffer.js';

const buildCertificationCenter = function ({
  id = databaseBuffer.getNextId(),
  name = 'some name',
  type = 'SUP',
  externalId = 'EX123',
  createdAt = new Date('2020-01-01'),
  updatedAt,
} = {}) {
  const values = {
    id,
    name,
    type,
    externalId,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-centers',
    values,
  });
};

export { buildCertificationCenter };
