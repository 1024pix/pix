export class LegalDocumentStatusDTO {
  constructor({ status, acceptedAt, documentPath }) {
    this.status = status;
    this.acceptedAt = acceptedAt;
    this.documentPath = documentPath;
  }
}
