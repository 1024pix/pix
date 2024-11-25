import { CampaignCodeError, UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';
import { ArchivedCampaignError, DeletedCampaignError } from '../errors.js';

const getPresentationSteps = async function ({
  userId,
  campaignCode,
  locale,
  badgeRepository,
  campaignRepository,
  campaignParticipationRepository,
  learningContentRepository,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);

  if (!campaign) throw new CampaignCodeError();
  if (campaign.archivedAt) throw new ArchivedCampaignError();
  if (campaign.deletedAt) throw new DeletedCampaignError();

  const hasUserAccessToCampaign = await campaignParticipationRepository.findOneByCampaignIdAndUserId({
    campaignId: campaign.id,
    userId,
  });
  if (!hasUserAccessToCampaign)
    throw new UserNotAuthorizedToAccessEntityError('User does not have access to this campaign');

  const campaignBadges = await badgeRepository.findByCampaignId(campaign.id);
  const learningContent = await learningContentRepository.findByCampaignId(campaign.id, locale);

  return {
    customLandingPageText: campaign.customLandingPageText,
    badges: campaignBadges,
    competences: learningContent?.competences,
  };
};

export { getPresentationSteps };
