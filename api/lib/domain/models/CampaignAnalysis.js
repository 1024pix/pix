class CampaignAnalysis {

  constructor({
    id,
    // attributes
    campaignTubeRecommendations = [],
  } = {}) {
    this.id = id;
    // attributes
    this.campaignTubeRecommendations = campaignTubeRecommendations;
  }
}

module.exports = CampaignAnalysis;
