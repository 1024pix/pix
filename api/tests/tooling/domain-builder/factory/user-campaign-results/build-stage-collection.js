import { StageCollection } from '../../../../../lib/shared/domain/models/user-campaign-results/StageCollection.js';

const buildStageCollection = function ({ campaignId, stages } = {}) {
  return new StageCollection({ campaignId, stages });
};

export { buildStageCollection };
