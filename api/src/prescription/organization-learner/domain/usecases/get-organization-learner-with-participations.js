import { tagRepository as injectedTagRepository } from '../../../../organizational-entities/infrastructure/repositories/tag.repository.js';
import * as injectedOrganizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as injectedCampaignParticipationOverviewRepository from '../../../campaign-participation/infrastructure/repositories/campaign-participation-overview-repository.js';
import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';
export const getOrganizationLearnerWithParticipations = async function ({
  organizationId,
  userId,
  organizationLearnerRepository = injectedRepositories.organizationLearnerRepository,
  organizationRepository = injectedOrganizationRepository,
  campaignParticipationOverviewRepository = injectedCampaignParticipationOverviewRepository,
  tagRepository = injectedTagRepository,
} = {}) {
  const organizationLearnerId = await organizationLearnerRepository.getIdByUserIdAndOrganizationId({
    organizationId,
    userId,
  });
  const organization = await organizationRepository.get(organizationId);
  const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByOrganizationLearnerId({
    organizationLearnerId,
  });
  const tags = await tagRepository.findByIds(organization.tags.map((tag) => tag.id));

  return {
    organizationLearner: { id: organizationLearnerId },
    organization,
    campaignParticipations: campaignParticipationOverviews,
    tagNames: tags.map((tag) => tag.name),
  };
};
