import { LegalDocumentStatusDTO } from '../../../../../src/legal-documents/application/api/LegalDocumentStatusDTO.js';
import { STATUS } from '../../../../../src/legal-documents/domain/models/LegalDocumentStatus.js';

const buildLegalDocumentStatusDTO = function ({
  status = STATUS.ACCEPTED,
  acceptedAt = null,
  documentPath = null,
} = {}) {
  return new LegalDocumentStatusDTO({
    status,
    acceptedAt,
    documentPath,
  });
};

export { buildLegalDocumentStatusDTO };
