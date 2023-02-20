import Assessment from '../models/Assessment';

import { AlreadySharedCampaignParticipationError, UserNotAuthorizedToAccessEntityError } from '../../domain/errors';

export default async function beginCampaignParticipationImprovement({
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
}
