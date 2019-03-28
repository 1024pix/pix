class CampaignParticipationResult {
  constructor({
    id,
    // attributes
    isCompleted,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
    // relationships
    competenceResults = [],
  } = {}) {
    this.id = id;
    // attributes
    this.isCompleted = isCompleted;
    this.totalSkillsCount = totalSkillsCount;
    this.testedSkillsCount = testedSkillsCount;
    this.validatedSkillsCount = validatedSkillsCount;
    // relationships
    this.competenceResults = competenceResults;
  }
}

module.exports = CampaignParticipationResult;
