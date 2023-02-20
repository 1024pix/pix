import { UserNotAuthorizedToAccessEntityError } from '../errors';
import CampaignParticipationResultsShared from '../events/CampaignParticipationResultsShared';

export default async function shareCampaignResult({
  userId,
  campaignParticipationId,
  campaignParticipationRepository,
  domainTransaction,
}) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId, domainTransaction);

  _checkUserIsOwnerOfCampaignParticipation(campaignParticipation, userId);

  campaignParticipation.share();
  await campaignParticipationRepository.updateWithSnapshot(campaignParticipation, domainTransaction);

  return new CampaignParticipationResultsShared({
    campaignParticipationId: campaignParticipation.id,
  });
}

function _checkUserIsOwnerOfCampaignParticipation(campaignParticipation, userId) {
  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError('User does not have an access to this campaign participation');
  }
}
