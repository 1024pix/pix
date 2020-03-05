class CampaignCollectiveResult {

  constructor({
    id,
    // attributes
    campaignCompetenceCollectiveResults = [],
    campaignTubeCollectiveResults = [],
  } = {}) {
    this.id = id;
    // attributes
    this.campaignCompetenceCollectiveResults = campaignCompetenceCollectiveResults;
    this.campaignTubeCollectiveResults = campaignTubeCollectiveResults;
  }
}

module.exports = CampaignCollectiveResult;
