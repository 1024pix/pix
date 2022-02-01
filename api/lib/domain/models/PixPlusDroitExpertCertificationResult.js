const statuses = {
  ACQUIRED: 'acquired',
  REJECTED: 'rejected',
  NOT_TAKEN: 'not_taken',
};

class PixPlusDroitExpertCertificationResult {
  constructor({ status } = {}) {
    this.status = status;
  }

  static buildFrom({ acquired }) {
    return new PixPlusDroitExpertCertificationResult({
      status: acquired ? statuses.ACQUIRED : statuses.REJECTED,
    });
  }

  static buildNotTaken() {
    return new PixPlusDroitExpertCertificationResult({
      status: statuses.NOT_TAKEN,
    });
  }

  isTaken() {
    return this.status !== statuses.NOT_TAKEN;
  }

  isAcquired() {
    return this.status === statuses.ACQUIRED;
  }
}

PixPlusDroitExpertCertificationResult.statuses = statuses;
module.exports = PixPlusDroitExpertCertificationResult;
