import { databaseBuffer } from '../database-buffer.js';

const buildLegalDocumentVersion = function ({
  id = databaseBuffer.getNextId(),
  service,
  type,
  versionAt = new Date(),
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'legal-document-versions',
    values: { id, service, type, versionAt },
  });
};

export { buildLegalDocumentVersion };
