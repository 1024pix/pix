const cleaStatuses = {
  ACQUIRED: 'acquired',
  REJECTED: 'rejected',
  NOT_PASSED: 'not_passed',
};

class CleaCertificationResult {

  constructor({
    status,
  } = {}) {
    this.status = status;
  }

  static from({ acquired }) {
    return new CleaCertificationResult({
      status: acquired ? cleaStatuses.ACQUIRED : cleaStatuses.REJECTED,
    });
  }

  static buildNotPassed() {
    return new CleaCertificationResult({
      status: cleaStatuses.NOT_PASSED,
    });
  }
}

CleaCertificationResult.cleaStatuses = cleaStatuses;
module.exports = CleaCertificationResult;
