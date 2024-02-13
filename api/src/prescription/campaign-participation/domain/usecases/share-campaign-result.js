import { UserNotAuthorizedToAccessEntityError } from '../../../../../lib/domain/errors.js';
import { CampaignParticipationResultsShared } from '../../../../../lib/domain/events/CampaignParticipationResultsShared.js';

const shareCampaignResult = async function ({ userId, campaignParticipationId, campaignParticipationRepository }) {
  const campaignParticipation = await campaignParticipationRepository.get(campaignParticipationId);

  _checkUserIsOwnerOfCampaignParticipation(campaignParticipation, userId);

  campaignParticipation.share();
  await campaignParticipationRepository.updateWithSnapshot(campaignParticipation);

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
