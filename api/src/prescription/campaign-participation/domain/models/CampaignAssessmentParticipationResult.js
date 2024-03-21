import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
import { CampaignAssessmentParticipationCompetenceResult } from './CampaignAssessmentParticipationCompetenceResult.js';

const { SHARED } = CampaignParticipationStatuses;

class CampaignAssessmentParticipationResult {
  constructor({
    campaignParticipationId,
    campaignId,
    status,
    campaignLearningContent,
    validatedTargetedKnowledgeElementsCountByCompetenceId = {},
  }) {
    this.campaignParticipationId = campaignParticipationId;
    this.campaignId = campaignId;
    this.isShared = status === SHARED;

    if (status !== SHARED) {
      this.competenceResults = [];
    } else {
      this.competenceResults = campaignLearningContent.competences.map((competence) => {
        const area = campaignLearningContent.findAreaOfCompetence(competence);
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

export { CampaignAssessmentParticipationResult };
