class CertificationCandidate {
  /**
   * @param {object} param
   * @param {number} param.id
   * @param {number} param.userId
   * @param {Date} param.reconciledAt
   * @param {string} param.resultRecipientEmail
   */
  constructor({ id, userId, reconciledAt, resultRecipientEmail } = {}) {
    this.id = id;
    this.userId = userId;
    this.reconciledAt = reconciledAt;
    this.resultRecipientEmail = resultRecipientEmail;
  }
}

export { CertificationCandidate };
