const TYPES = {
  CAMPAIGN_PARTICIPATION_START: 'CAMPAIGN_PARTICIPATION_START',
  CAMPAIGN_PARTICIPATION_COMPLETION: 'CAMPAIGN_PARTICIPATION_COMPLETION',
  CAMPAIGN_PARTICIPATION_SHARING: 'CAMPAIGN_PARTICIPATION_SHARING',
};

class PoleEmploiSending {
  constructor({
    campaignParticipationId,
    type,
    payload,
  }) {
    this.campaignParticipationId = campaignParticipationId;
    this.type = type;
    this.isSuccessful = undefined;
    this.responseCode = undefined;
    this.payload = payload;
  }

  succeed(responseCode) {
    this.isSuccessful = true;
    this.responseCode = responseCode;
  }

  fail(responseCode) {
    this.isSuccessful = false;
    this.responseCode = responseCode;
  }
}

PoleEmploiSending.TYPES = TYPES;
module.exports = PoleEmploiSending;

