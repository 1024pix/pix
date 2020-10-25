const CampaignAssessmentParticipationCompetenceResult = require('./CampaignAssessmentParticipationCompetenceResult');

class CampaignAssessmentParticipationResult {
  constructor({
    campaignParticipationId,
    campaignId,
    isShared,
    targetedCompetences,
    targetProfile,
    validatedTargetedKnowledgeElementsCountByCompetenceId = {},
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
            validatedTargetedKnowledgeElementsCount : validatedTargetedKnowledgeElementsCountByCompetenceId[targetedCompetence.id],
          });
        });
    }
  }
}

module.exports = CampaignAssessmentParticipationResult;
