import { LegalDocument } from '../../../../../src/legal-documents/domain/models/LegalDocument.js';
import { LegalDocumentService } from '../../../../../src/legal-documents/domain/models/LegalDocumentService.js';
import { LegalDocumentType } from '../../../../../src/legal-documents/domain/models/LegalDocumentType.js';

const buildLegalDocument = function ({
  id = 123,
  type = LegalDocumentType.VALUES.TOS,
  service = LegalDocumentService.VALUES.PIX_ORGA,
  versionAt = new Date(),
} = {}) {
  return new LegalDocument({
    id,
    type,
    service,
    versionAt,
  });
};

export { buildLegalDocument };
