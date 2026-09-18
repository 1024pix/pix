import { usecases } from '../../domain/usecases/index.js';

/**
 * @param {{ campaignId: number }} params
 * @returns {Promise<Array<number>>} List of id of highlighted trainings in engine recommended campaign
 */
const getHighlightedTrainingsForCampaign = async ({ campaignId }) => {
  return await usecases.getHighlightedTrainingsForCampaign({ campaignId });
};

export { getHighlightedTrainingsForCampaign };
