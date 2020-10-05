const CampaignAssessmentParticipationCompetenceResult = require('./CampaignAssessmentParticipationCompetenceResult');

class CampaignAssessmentParticipationResult {
  constructor({
    campaignParticipationId,
    campaignId,
    isShared,
    targetedCompetences,
    targetProfile,
    validatedTargetedKnowledgeElementsByCompetenceId = {},
  }) {
    this.campaignParticipationId = campaignParticipationId;
    this.campaignId = campaignId;
    this.isShared = isShared;
    if (!this.isShared) {
      this.competenceResults = [];
    } else {
      this.competenceResults = targetedCompetences
        .map((targetedCompetence) => {
          const targetedArea = targetProfile.getAreaOfCompetence(targetedCompetence.id);
          return new CampaignAssessmentParticipationCompetenceResult({
            targetedArea,
            targetedCompetence,
            targetedSkillsCount: targetedCompetence.skillCount,
            validatedTargetedKnowledgeElementsCount : validatedTargetedKnowledgeElementsByCompetenceId[targetedCompetence.id].length,
          });
        });
    }
  }
}

module.exports = CampaignAssessmentParticipationResult;
