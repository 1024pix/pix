const statuses = {
  ACQUIRED: 'acquired',
  REJECTED: 'rejected',
  NOT_TAKEN: 'not_taken',
};

const badgeKey = 'PIX_DROIT_EXPERT_CERTIF';

class PixPlusDroitExpertCertificationResult {

  constructor({
    status,
  } = {}) {
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
}

PixPlusDroitExpertCertificationResult.statuses = statuses;
PixPlusDroitExpertCertificationResult.badgeKey = badgeKey;
module.exports = PixPlusDroitExpertCertificationResult;
