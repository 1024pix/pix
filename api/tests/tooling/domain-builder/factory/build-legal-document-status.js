import { LegalDocumentStatus, STATUS } from '../../../../src/legal-documents/domain/models/LegalDocumentStatus.js';
const buildLegalDocumentStatus = function ({ status = STATUS.ACCEPTED, acceptedAt = null, documentPath = null } = {}) {
  return new LegalDocumentStatus({
    status,
    acceptedAt,
    documentPath,
  });
};

export { buildLegalDocumentStatus };
