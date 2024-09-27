class CertificationCandidate {
  /**
   * @param {Object} param
   * @param {number} param.userId
   * @param {Date} param.reconciledAt
   */
  constructor({ userId, reconciledAt } = {}) {
    this.userId = userId;
    this.reconciledAt = reconciledAt;
  }
}

export { CertificationCandidate };
