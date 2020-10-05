class CampaignAssessmentParticipationCompetenceResult {
  constructor({
    targetedArea,
    targetedCompetence,
    targetedSkillsCount,
    validatedTargetedKnowledgeElementsCount,
  } = {}) {
    this.id = targetedCompetence.id;
    this.name = targetedCompetence.name;
    this.index = targetedCompetence.index;
    this.areaColor = targetedArea.color;
    this.targetedSkillsCount = targetedSkillsCount;
    this.validatedSkillsCount = validatedTargetedKnowledgeElementsCount;
  }
}

module.exports = CampaignAssessmentParticipationCompetenceResult;
