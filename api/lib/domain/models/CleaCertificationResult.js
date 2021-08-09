const { keys } = require('./Badge');

const cleaStatuses = {
  ACQUIRED: 'acquired',
  REJECTED: 'rejected',
  NOT_TAKEN: 'not_taken',
};
const badgeKeyV1 = keys.PIX_EMPLOI_CLEA;
const badgeKeyV2 = keys.PIX_EMPLOI_CLEA_V2;

class CleaCertificationResult {

  constructor({
    status,
  } = {}) {
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
CleaCertificationResult.badgeKeyV1 = badgeKeyV1;
CleaCertificationResult.badgeKeyV2 = badgeKeyV2;
module.exports = CleaCertificationResult;
