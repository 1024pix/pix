class CampaignParticipationResult {
  constructor({
    id,
    // attributes
    totalSkills,
    testedSkills,
    validatedSkills,
    isCompleted,
  } = {}) {
    this.id = id;
    // attributes
    this.totalSkills = totalSkills;
    this.testedSkills = testedSkills;
    this.validatedSkills = validatedSkills;
    this.isCompleted = isCompleted;
  }
}

module.exports = CampaignParticipationResult;
