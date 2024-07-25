import {
  AlreadySharedCampaignParticipationError,
  UserNotAuthorizedToAccessEntityError,
} from '../../../../shared/domain/errors.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';

const beginCampaignParticipationImprovement = async function ({
  campaignParticipationId,
  userId,
  assessmentRepository,
  campaignParticipationRepository,
  domainTransaction,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId, domainTransaction);
  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }

  if (campaignParticipation.isShared) {
    throw new AlreadySharedCampaignParticipationError();
  }

  campaignParticipation.improve();
  await campaignParticipationRepository.update(campaignParticipation, domainTransaction);

  if (campaignParticipation.lastAssessment.isImproving && !campaignParticipation.lastAssessment.isCompleted()) {
    return null;
  }

  const assessment = Assessment.createImprovingForCampaign({ userId, campaignParticipationId });
  await assessmentRepository.save({ assessment, domainTransaction });
};

export { beginCampaignParticipationImprovement };
