import * as injectedBadgeRepository from '../../../../evaluation/infrastructure/repositories/badge-repository.js';
import { CampaignCodeError, UserNotAuthorizedToAccessEntityError } from '../../../../shared/domain/errors.js';
import * as injectedCampaignParticipationRepository from '../../../campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as injectedLearningContentRepository from '../../../shared/infrastructure/repositories/learning-content-repository.js';
import * as injectedCampaignRepository from '../../infrastructure/repositories/campaign-repository.js';
import { ArchivedCampaignError, DeletedCampaignError } from '../errors.js';

const getPresentationSteps = async function ({
  userId,
  campaignCode,
  locale,
  badgeRepository = injectedBadgeRepository,
  campaignRepository = injectedCampaignRepository,
  campaignParticipationRepository = injectedCampaignParticipationRepository,
  learningContentRepository = injectedLearningContentRepository,
} = {}) {
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
