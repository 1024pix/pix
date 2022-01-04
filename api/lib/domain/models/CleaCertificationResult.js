const cleaStatuses = {
  ACQUIRED: 'acquired',
  REJECTED: 'rejected',
  NOT_TAKEN: 'not_taken',
};

class CleaCertificationResult {
  constructor({ status } = {}) {
    this.status = status;
  }

  static buildFrom({ acquired }) {
    return new CleaCertificationResult({
      status: acquired ? cleaStatuses.ACQUIRED : cleaStatuses.REJECTED,
    });
  }

  static buildNotTaken() {
    return new CleaCertificationResult({
      status: cleaStatuses.NOT_TAKEN,
    });
  }

  isTaken() {
    return this.status !== cleaStatuses.NOT_TAKEN;
  }

  isAcquired() {
    return this.status === cleaStatuses.ACQUIRED;
  }
}

CleaCertificationResult.cleaStatuses = cleaStatuses;
module.exports = CleaCertificationResult;
