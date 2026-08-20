class CampaignAssessmentParticipationCompetenceResult {
  constructor({ campaignParticipationId, area, competence, skillsCount, validatedTargetedSkillsCount } = {}) {
    this.id = `${campaignParticipationId}-${competence.id}`;
    this.name = competence.name;
    this.index = competence.index;
    this.areaColor = area.color;
    this.competenceMasteryRate = Number((validatedTargetedSkillsCount / skillsCount).toFixed(2));
  }
}

export { CampaignAssessmentParticipationCompetenceResult };
