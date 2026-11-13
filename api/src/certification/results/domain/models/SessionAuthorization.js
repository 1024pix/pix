export class SessionAuthorization {
  constructor({ id, sessionStatus }) {
    this.id = id;
    this.sessionStatus = sessionStatus;
  }

  canResultRecipientDownloadResult() {
    return this.sessionStatus.isProcessed();
  }

  get canCreateCertificatesPdf() {
    return this.sessionStatus.isProcessed();
  }
}
