class CampaignAssessmentParticipationCompetenceResult {
  constructor({
    targetedCompetence,
    targetedSkillsCount,
    validatedTargetedKnowledgeElementsCount,
  } = {}) {
    this.id = targetedCompetence.id;
    this.name = targetedCompetence.name;
    this.index = targetedCompetence.index;
    this.areaColor = targetedCompetence.area && targetedCompetence.area.color;
    this.targetedSkillsCount = targetedSkillsCount;
    this.validatedSkillsCount = validatedTargetedKnowledgeElementsCount;
  }
}

module.exports = CampaignAssessmentParticipationCompetenceResult;
