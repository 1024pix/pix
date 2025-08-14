import { UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import * as injectedAssessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';
import * as injectedCampaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';

const beginCampaignParticipationImprovement = async function ({
  campaignParticipationId,
  userId,
  assessmentRepository = injectedAssessmentRepository,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
} = {}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);
  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }

  campaignParticipation.improve();

  await campaignParticipationRepository.update(campaignParticipation);

  if (campaignParticipation.lastAssessment.isImproving && !campaignParticipation.lastAssessment.isCompleted()) {
    return null;
  }

  const assessment = Assessment.createImprovingForCampaign({
    userId,
    campaignParticipationId,
    campaign: campaignParticipation.campaign,
  });
  await assessmentRepository.save({ assessment });
};

export { beginCampaignParticipationImprovement };
