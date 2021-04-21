const { keys } = require('./Badge');

const cleaStatuses = {
  ACQUIRED: 'acquired',
  REJECTED: 'rejected',
  NOT_TAKEN: 'not_taken',
};
const badgeKey = keys.PIX_EMPLOI_CLEA;

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

  static buildNotTaken() {
    return new CleaCertificationResult({
      status: cleaStatuses.NOT_TAKEN,
    });
  }
}

CleaCertificationResult.cleaStatuses = cleaStatuses;
CleaCertificationResult.badgeKey = badgeKey;
module.exports = CleaCertificationResult;
