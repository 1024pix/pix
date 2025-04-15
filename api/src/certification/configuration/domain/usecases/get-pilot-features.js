/**
 * @typedef {import ('../../domain/usecases/index.js').CenterPilotFeaturesRepository} CenterPilotFeaturesRepository
 * @typedef {import ('../models/CenterPilotFeatures.js').CenterPilotFeatures} CenterPilotFeatures
 */

/**
 * @param {Object} params
 * @param {number} params.centerId
 * @param {CenterPilotFeaturesRepository} params.centerPilotFeaturesRepository
 * @returns {Promise<CenterPilotFeatures>}
 */
export const getCenterPilotFeatures = async ({ centerId, centerPilotFeaturesRepository }) => {
  const centerPilotFeatures = await centerPilotFeaturesRepository.getByCenterId({ centerId });

  return centerPilotFeatures;
};
