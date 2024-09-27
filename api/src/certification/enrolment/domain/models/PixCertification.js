export class PixCertification {
  constructor({ pixScore, status, isCancelled, isRejectedForFraud }) {
    this.pixScore = pixScore;
    this.status = status;
    this.isCancelled = isCancelled;
    this.isRejectedForFraud = isRejectedForFraud;
  }
}
