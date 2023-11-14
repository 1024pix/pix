import { StageCollection } from '../../../../../src/shared/domain/models/target-profile-management/StageCollection.js';

const buildStageCollection = function ({ id, stages = [], maxLevel } = {}) {
  return new StageCollection({ id, stages, maxLevel });
};

export { buildStageCollection };
