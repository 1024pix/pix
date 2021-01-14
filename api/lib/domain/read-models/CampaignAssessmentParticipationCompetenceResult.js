class CampaignAssessmentParticipationCompetenceResult {
  constructor({
    campaignParticipationId,
    targetedArea,
    targetedCompetence,
    targetedSkillsCount,
    validatedTargetedKnowledgeElementsCount,
  } = {}) {
    this.id = `${campaignParticipationId}-${targetedCompetence.id}`;
    this.name = targetedCompetence.name;
    this.index = targetedCompetence.index;
    this.areaColor = targetedArea.color;
    this.targetedSkillsCount = targetedSkillsCount;
    this.validatedSkillsCount = validatedTargetedKnowledgeElementsCount;
  }
}

module.exports = CampaignAssessmentParticipationCompetenceResult;
