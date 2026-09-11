import { STATUS } from '../../domain/models/LegalDocumentStatus.js';

export class LegalDocumentStatusDTO {
  constructor({ status, acceptedAt, documentPath }) {
    this.status = status;
    this.acceptedAt = acceptedAt;
    this.documentPath = documentPath;
  }

  get isAccepted() {
    return this.status === STATUS.ACCEPTED;
  }
}
