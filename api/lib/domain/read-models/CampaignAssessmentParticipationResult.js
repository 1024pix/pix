const CampaignParticipationStatuses = require('../models/CampaignParticipationStatuses');
const CampaignAssessmentParticipationCompetenceResult = require('./CampaignAssessmentParticipationCompetenceResult');

const { SHARED } = CampaignParticipationStatuses;

class CampaignAssessmentParticipationResult {
  constructor({
    campaignParticipationId,
    campaignId,
    status,
    competences,
    validatedTargetedKnowledgeElementsCountByCompetenceId = {},
  }) {
    this.campaignParticipationId = campaignParticipationId;
    this.campaignId = campaignId;
    this.isShared = status === SHARED;

    if (status !== SHARED) {
      this.competenceResults = [];
    } else {
      this.competenceResults = competences.map((competence) => {
        const area = competence.area;
        return new CampaignAssessmentParticipationCompetenceResult({
          campaignParticipationId,
          area,
          competence,
          skillsCount: competence.skillCount,
          validatedTargetedKnowledgeElementsCount: validatedTargetedKnowledgeElementsCountByCompetenceId[competence.id],
        });
      });
    }
  }
}

module.exports = CampaignAssessmentParticipationResult;
