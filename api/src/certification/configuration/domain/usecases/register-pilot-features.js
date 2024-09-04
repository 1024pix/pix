/**
 * @typedef {import ('../../domain/usecases/index.js').CenterPilotFeaturesRepository} CenterPilotFeaturesRepository
 */

/**
 * @param {Object} params
 * @param {CenterPilotFeaturesRepository} params.centerPilotFeaturesRepository
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
