import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

const getTargetProfile = async function ({
  campaignId,
  targetProfileRepository = injectedRepositories.targetProfileRepository,
} = {}) {
  return targetProfileRepository.getByCampaignId({ campaignId });
};

export { getTargetProfile };
