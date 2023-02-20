class CampaignAssessmentParticipationCompetenceResult {
  constructor({
    campaignParticipationId,
    area,
    competence,
    skillsCount,
    validatedTargetedKnowledgeElementsCount,
  } = {}) {
    this.id = `${campaignParticipationId}-${competence.id}`;
    this.name = competence.name;
    this.index = competence.index;
    this.areaColor = area.color;
    this.competenceMasteryRate = Number((validatedTargetedKnowledgeElementsCount / skillsCount).toFixed(2));
  }
}

export default CampaignAssessmentParticipationCompetenceResult;
