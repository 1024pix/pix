import { UserNotAuthorizedToAccessEntityError } from '../errors.js';

const getCampaignProfile = async function ({
  userId,
  campaignId,
  campaignParticipationId,
  campaignRepository,
  campaignProfileRepository,
  locale,
}) {
  if (!(await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId))) {
    throw new UserNotAuthorizedToAccessEntityError('User does not belong to an organization that owns the campaign');
  }

  return campaignProfileRepository.findProfile({ campaignId, campaignParticipationId, locale });
};

export { getCampaignProfile };
