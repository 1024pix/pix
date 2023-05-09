import { UserNotAuthorizedToAccessEntityError } from '../errors.js';
import { CampaignParticipationResultsShared } from '../events/CampaignParticipationResultsShared.js';

const shareCampaignResult = async function ({
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
};

export { shareCampaignResult };

function _checkUserIsOwnerOfCampaignParticipation(campaignParticipation, userId) {
  if (campaignParticipation.userId !== userId) {
    throw new UserNotAuthorizedToAccessEntityError('User does not have an access to this campaign participation');
  }
}
