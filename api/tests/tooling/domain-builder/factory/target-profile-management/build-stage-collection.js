import StageCollection from '../../../../../lib/domain/models/target-profile-management/StageCollection';

const buildStageCollection = function ({ id, stages, maxLevel } = {}) {
  return new StageCollection({ id, stages, maxLevel });
};

export default buildStageCollection;
