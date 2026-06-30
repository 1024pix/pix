import { databaseBuffer } from '../database-buffer.js';
import { buildCampaignParticipation } from './build-campaign-participation.js';
import { buildStage } from './build-stage.js';

const buildStageAcquisition = function ({
  id = databaseBuffer.getNextId(),
  stageId = buildStage().id,
  campaignParticipationId = buildCampaignParticipation().id,
  createdAt = new Date('2000-01-01'),
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'stage-acquisitions',
    values: {
      id,
      stageId,
      campaignParticipationId,
      createdAt,
    },
  });
};

export { buildStageAcquisition };
