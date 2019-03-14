class CampaignParticipationResult {
  constructor({
    id,
    // attributes
    isCompleted,
    totalSkillsCount,
    testedSkillsCount,
    validatedSkillsCount,
  } = {}) {
    this.id = id;
    // attributes
    this.isCompleted = isCompleted;
    this.totalSkillsCount = totalSkillsCount;
    this.testedSkillsCount = testedSkillsCount;
    this.validatedSkillsCount = validatedSkillsCount;
  }
}

module.exports = CampaignParticipationResult;
