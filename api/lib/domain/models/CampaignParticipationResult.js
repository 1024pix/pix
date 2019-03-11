class CampaignParticipationResult {
  constructor({
    id,
    // attributes
    isCompleted,
    totalSkills,
    testedSkills,
    validatedSkills,
  } = {}) {
    this.id = id;
    // attributes
    this.isCompleted = isCompleted;
    this.totalSkills = totalSkills;
    this.testedSkills = testedSkills;
    this.validatedSkills = validatedSkills;
  }
}

module.exports = CampaignParticipationResult;
