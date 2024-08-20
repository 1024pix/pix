import { databaseBuffer } from '../database-buffer.js';

const buildAttestation = function ({
  id = databaseBuffer.getNextId(),
  createdAt = new Date(),
  templateName = '6eme-pdf',
} = {}) {
  const values = {
    id,
    createdAt,
    templateName,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'attestations',
    values,
  });
};

export { buildAttestation };
