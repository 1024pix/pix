import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
import { CampaignAssessmentParticipationCompetenceResult } from './CampaignAssessmentParticipationCompetenceResult.js';

const { SHARED } = CampaignParticipationStatuses;

class CampaignAssessmentParticipationResult {
  constructor({
    campaignParticipationId,
    campaignId,
    status,
    campaignLearningContent,
    validatedTargetedSkillsCountByCompetenceId = {},
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
          validatedTargetedSkillsCount: validatedTargetedSkillsCountByCompetenceId[competence.id],
        });
      });
    }
  }
}

export { CampaignAssessmentParticipationResult };
