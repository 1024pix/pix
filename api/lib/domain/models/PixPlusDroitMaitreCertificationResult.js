const statuses = {
  ACQUIRED: 'acquired',
  REJECTED: 'rejected',
  NOT_TAKEN: 'not_taken',
};

class PixPlusDroitMaitreCertificationResult {
  constructor({ status } = {}) {
    this.status = status;
  }

  static buildFrom({ acquired }) {
    return new PixPlusDroitMaitreCertificationResult({
      status: acquired ? statuses.ACQUIRED : statuses.REJECTED,
    });
  }

  static buildNotTaken() {
    return new PixPlusDroitMaitreCertificationResult({
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

PixPlusDroitMaitreCertificationResult.statuses = statuses;
module.exports = PixPlusDroitMaitreCertificationResult;
