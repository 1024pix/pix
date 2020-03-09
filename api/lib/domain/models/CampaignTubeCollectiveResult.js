class CampaignTubeCollectiveResult {

  constructor({
    // attributes
    campaignId,
    competenceName,
    tubeId,
    tubePracticalTitle,
    areaColor,
    totalSkillsCount,
    averageValidatedSkills,
  } = {}) {
    // attributes
    this.campaignId = campaignId;
    this.competenceName = competenceName;
    this.tubeId = tubeId;
    this.tubePracticalTitle = tubePracticalTitle;
    this.areaColor = areaColor;
    this.totalSkillsCount = totalSkillsCount;
    this.averageValidatedSkills = averageValidatedSkills;
  }

  get id() {
    return `${this.campaignId}_${this.tubeId}`;
  }
}

module.exports = CampaignTubeCollectiveResult;
