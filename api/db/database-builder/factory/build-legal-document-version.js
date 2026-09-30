import { LegalDocumentService } from '../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../src/legal-documents/domain/models/LegalDocumentType.js';
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

const buildPixAppTos = function () {
  return buildLegalDocumentVersion({
    service: LegalDocumentService.VALUES.PIX_APP,
    type: LegalDocumentType.VALUES.TOS,
    versionAt: new Date('2026-09-03'),
  });
};

export { buildLegalDocumentVersion, buildPixAppTos };
