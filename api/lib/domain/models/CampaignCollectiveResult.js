class CampaignCollectiveResult {

  constructor({
    id,
    // attributes
    campaignCompetenceCollectiveResults = [],
  } = {}) {
    this.id = id;
    // attributes
    this.campaignCompetenceCollectiveResults = campaignCompetenceCollectiveResults;
  }
}

module.exports = CampaignCollectiveResult;
