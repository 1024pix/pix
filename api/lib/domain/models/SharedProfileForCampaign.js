class SharedProfileForCampaign {
  constructor({ id, sharedAt, pixScore, campaignAllowsRetry, isRegistrationActive, scorecards = [] }) {
    this.id = id;
    this.sharedAt = sharedAt;
    this.scorecards = scorecards;
    this.pixScore = pixScore || 0;
    this.canRetry = this._computeCanRetry(campaignAllowsRetry, sharedAt, isRegistrationActive);
  }

  _computeCanRetry(campaignAllowsRetry, sharedAt, isRegistrationActive) {
    return campaignAllowsRetry && Boolean(sharedAt) && isRegistrationActive;
  }
}

module.exports = SharedProfileForCampaign;
