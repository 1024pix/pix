class SharedProfileForCampaign {
  constructor({
    id,
    sharedAt,
    pixScore,
    scorecards = [],
  }) {
    this.id = id;
    this.sharedAt = sharedAt;
    this.pixScore = pixScore;
    this.scorecards = scorecards;
  }
}

module.exports = SharedProfileForCampaign;
