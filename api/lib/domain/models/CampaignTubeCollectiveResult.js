class CampaignTubeCollectiveResult {

  constructor({
    // attributes
    campaignId,
    tubeId,
    tubePracticalTitle,
    totalSkillsCount,
    averageValidatedSkills,
  } = {}) {
    // attributes
    this.campaignId = campaignId;
    this.tubeId = tubeId;
    this.tubePracticalTitle = tubePracticalTitle;
    this.totalSkillsCount = totalSkillsCount;
    this.averageValidatedSkills = averageValidatedSkills;
  }

  get id() {
    return `${this.campaignId}_${this.tubeId}`;
  }
}

module.exports = CampaignTubeCollectiveResult;
