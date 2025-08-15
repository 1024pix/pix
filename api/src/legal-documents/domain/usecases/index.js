import { acceptLegalDocumentByUserId } from './accept-legal-document-by-user-id.usecase.js';
import { createLegalDocument } from './create-legal-document.usecase.js';
import { getLegalDocumentStatusByUserId } from './get-legal-document-status-by-user-id.usecase.js';

const usecases = {
  acceptLegalDocumentByUserId,
  createLegalDocument,
  getLegalDocumentStatusByUserId,
};

export { usecases };
