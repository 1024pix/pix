import { StageAcquisition } from '../../../../src/evaluation/domain/models/StageAcquisition.js';

const buildStageAcquisition = function ({
  id = 1,
  userId = 3000,
  stageId = 4000,
  campaignParticipationId = 5000,
} = {}) {
  return new StageAcquisition({
    id,
    userId,
    stageId,
    campaignParticipationId,
  });
};

export { buildStageAcquisition };
