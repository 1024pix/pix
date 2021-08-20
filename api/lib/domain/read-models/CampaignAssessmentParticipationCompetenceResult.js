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
    this.competenceMasteryRate = Number((validatedTargetedKnowledgeElementsCount / targetedSkillsCount).toFixed(2));
  }
}

module.exports = CampaignAssessmentParticipationCompetenceResult;
