import { CampaignCodeError } from '../../../../shared/domain/errors.js';
import { ArchivedCampaignError, DeletedCampaignError } from '../errors.js';

const getPresentationSteps = async function ({
  campaignCode,
  locale,
  badgeRepository,
  campaignRepository,
  learningContentRepository,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) throw new CampaignCodeError();

  if (campaign.archivedAt) throw new ArchivedCampaignError();
  if (campaign.deletedAt) throw new DeletedCampaignError();

  const campaignBadges = await badgeRepository.findByCampaignId(campaign.id);

  const learningContent = await learningContentRepository.findByCampaignId(campaign.id, locale);
  const campaignCompetences = learningContent?.competences;

  return {
    customLandingPageText: campaign.customLandingPageText,
    badges: campaignBadges,
    competences: campaignCompetences,
  };
};

export { getPresentationSteps };
