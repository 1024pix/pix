class CampaignCompetenceCollectiveResult {

  constructor({
    campaignId,
    targetedArea,
    targetedCompetence,
    averageValidatedSkills,
  } = {}) {
    this.campaignId = campaignId;
    this.competenceId = targetedCompetence.id;
    this.competenceIndex = targetedCompetence.index;
    this.competenceName = targetedCompetence.name;
    this.areaColor = targetedArea.color;
    this.targetedSkillsCount = targetedCompetence.skillCount;
    this.averageValidatedSkills = averageValidatedSkills;
  }

  get id() {
    return `${this.campaignId}_${this.competenceId}`;
  }

  get areaCode() {
    return this.competenceIndex.split('.')[0];
  }
}

module.exports = CampaignCompetenceCollectiveResult;
