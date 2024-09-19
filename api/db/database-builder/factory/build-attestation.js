import { ATTESTATIONS_TABLE_NAME } from '../../migrations/20240820101115_add-attestations-table.js';
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
    tableName: ATTESTATIONS_TABLE_NAME,
    values,
  });
};

export { buildAttestation };
