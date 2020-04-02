class CampaignTubeRecommendation {

  constructor({
    // attributes
    campaignId,
    tubeId,
    competenceId,
    competenceName,
    tubePracticalTitle,
    areaColor,
  } = {}) {
    // attributes
    this.campaignId = campaignId;
    this.tubeId = tubeId;
    this.competenceId = competenceId;
    this.competenceName = competenceName;
    this.tubePracticalTitle = tubePracticalTitle;
    this.areaColor = areaColor;
  }

  get id() {
    return `${this.campaignId}_${this.tubeId}`;
  }
}

module.exports = CampaignTubeRecommendation;
