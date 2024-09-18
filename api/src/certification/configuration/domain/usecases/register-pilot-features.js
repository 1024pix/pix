/**
 * @typedef {import ('../../domain/usecases/index.js').CenterPilotFeaturesRepository} CenterPilotFeaturesRepository
 * @typedef {import ('../models/CenterPilotFeatures.js').CenterPilotFeatures} CenterPilotFeatures
 */

/**
 * @param {Object} params
 * @param {number} params.centerId
 * @param {boolean} params.isV3Pilot
 * @param {CenterPilotFeaturesRepository} params.centerPilotFeaturesRepository
 * @returns {Promise<CenterPilotFeatures>}
 */
export const registerCenterPilotFeatures = async ({ centerId, isV3Pilot, centerPilotFeaturesRepository }) => {
  const centerPilotFeatures = await centerPilotFeaturesRepository.getByCenterId({ centerId });

  if (isV3Pilot) {
    centerPilotFeatures.enableV3Pilot();
  } else {
    centerPilotFeatures.disableV3Pilot();
  }

  await centerPilotFeaturesRepository.update({ centerPilotFeatures });
  return centerPilotFeatures;
};
