const CampaignParticipation = require('../models/CampaignParticipation');
const CampaignAssessmentParticipationCompetenceResult = require('./CampaignAssessmentParticipationCompetenceResult');

const { SHARED } = CampaignParticipation.statuses;

class CampaignAssessmentParticipationResult {
  constructor({
    campaignParticipationId,
    campaignId,
    status,
    targetedCompetences,
    targetProfile,
    validatedTargetedKnowledgeElementsCountByCompetenceId = {},
  }) {
    this.campaignParticipationId = campaignParticipationId;
    this.campaignId = campaignId;
    this.isShared = status === SHARED;

    if (status !== SHARED) {
      this.competenceResults = [];
    } else {
      this.competenceResults = targetedCompetences.map((targetedCompetence) => {
        const targetedArea = targetProfile.getAreaOfCompetence(targetedCompetence.id);
        return new CampaignAssessmentParticipationCompetenceResult({
          campaignParticipationId,
          targetedArea,
          targetedCompetence,
          targetedSkillsCount: targetedCompetence.skillCount,
          validatedTargetedKnowledgeElementsCount:
            validatedTargetedKnowledgeElementsCountByCompetenceId[targetedCompetence.id],
        });
      });
    }
  }
}

module.exports = CampaignAssessmentParticipationResult;
