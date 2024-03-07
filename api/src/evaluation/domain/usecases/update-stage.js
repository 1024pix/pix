import { StageWithLinkedCampaignError } from '../errors.js';

/**
 * @typedef attributesToUpdate
 * @type {object}
 * @property {string} title
 * @property {number} level
 * @property {number} threshold
 * @property {string} title
 * @property {string} message
 * @property {string} prescriberTitle
 * @property {string} prescriberDescription
 */

/**
 * Update stage with payload
 *
 * @param {object} payloadStage
 * @param {number} payloadStage.id
 * @param {number} payloadStage.targetProfileId
 * @param {attributesToUpdate} payloadStage.attributesToUpdate
 * @param knexConnection
 *
 * @returns Promise<Stage[]>
 */
const updateStage = async function ({ payloadStage, stageRepository, targetProfileForAdminRepository }) {
  const stage = await stageRepository.get(payloadStage.id);

  const targetProfile = await targetProfileForAdminRepository.get({ id: payloadStage.targetProfileId });

  if (isStageNotUpdatable({ payloadStage, stage, targetProfile })) {
    throw new StageWithLinkedCampaignError();
  }

  return stageRepository.update(payloadStage);
};

function isStageNotUpdatable({ payloadStage, stage, targetProfile }) {
  const isLevelUpdated =
    payloadStage.attributesToUpdate.level >= 0 && payloadStage.attributesToUpdate.level !== stage.level;

  const isThresholdUpdated =
    payloadStage.attributesToUpdate.threshold >= 0 && payloadStage.attributesToUpdate.threshold !== stage.threshold;

  const isLevelOrTresholdUpdated = isLevelUpdated || isThresholdUpdated;

  return targetProfile.hasLinkedCampaign && isLevelOrTresholdUpdated;
}

export { isStageNotUpdatable, updateStage };
