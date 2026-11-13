export class SessionAuthorization {
  constructor({ id, sessionStatus }) {
    this.id = id;
    this.sessionStatus = sessionStatus;
  }

  get canCreateCertificatesPdf() {
    return this.sessionStatus.isProcessed();
  }
}
