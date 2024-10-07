import { ATTESTATIONS } from '../../../src/profile/domain/constants.js';
import { ATTESTATIONS_TABLE_NAME } from '../../migrations/20240820101115_add-attestations-table.js';
import { databaseBuffer } from '../database-buffer.js';

const buildAttestation = function ({
  id = databaseBuffer.getNextId(),
  createdAt = new Date(),
  templateName = '6eme-pdf',
  key = ATTESTATIONS.SIXTH_GRADE,
} = {}) {
  const values = {
    id,
    createdAt,
    templateName,
    key,
  };

  return databaseBuffer.pushInsertable({
    tableName: ATTESTATIONS_TABLE_NAME,
    values,
  });
};

export { buildAttestation };
