import { ATTESTATIONS } from '../../../src/profile/domain/constants.js';
import { databaseBuffer } from '../database-buffer.js';

const buildAttestation = function ({
  id = databaseBuffer.getNextId(),
  createdAt = new Date(),
  templateName = '6eme-pdf',
  key = ATTESTATIONS.SIXTH_GRADE,
  label = '6ème',
} = {}) {
  const values = {
    id,
    createdAt,
    templateName,
    key,
    label,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'attestations',
    values,
  });
};

export { buildAttestation };
