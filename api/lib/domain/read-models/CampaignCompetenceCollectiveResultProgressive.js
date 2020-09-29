class CampaignCompetenceCollectiveResultProgressive {

  constructor({
    campaignId,
    targetedArea,
    targetedCompetence,
  } = {}) {
    this.campaignId = campaignId;
    this.competenceId = targetedCompetence.id;
    this.competenceIndex = targetedCompetence.index;
    this.competenceName = targetedCompetence.name;
    this.areaColor = targetedArea.color;
    this.targetedSkillsCount = targetedCompetence.skillCount;
    this.validatedSkillCount = 0;
    this.averageValidatedSkills = 0;
  }

  get id() {
    return `${this.campaignId}_${this.competenceId}`;
  }

  get areaCode() {
    return this.competenceIndex.split('.')[0];
  }

  addValidatedSkillCount(validatedSkillCount) {
    this.validatedSkillCount += validatedSkillCount;
  }

  finalize(participantCount) {
    if (participantCount) {
      this.averageValidatedSkills = this.validatedSkillCount / participantCount;
    }
  }
}

module.exports = CampaignCompetenceCollectiveResultProgressive;
