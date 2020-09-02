class CampaignAssessmentParticipationCompetenceResult {
  constructor({
    id,
    name,
    index,
    totalSkillsCount,
    validatedSkillsCount,
    area,
  } = {}) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.totalSkillsCount = totalSkillsCount;
    this.validatedSkillsCount = validatedSkillsCount;
    this.areaColor = area && area.color;
  }
}

module.exports = CampaignAssessmentParticipationCompetenceResult;
