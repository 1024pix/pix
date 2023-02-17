const StageCollection = require('../../../../../lib/domain/models/target-profile-management/StageCollection');

const buildStageCollection = function ({ id, stages, maxLevel } = {}) {
  return new StageCollection({ id, stages, maxLevel });
};

module.exports = buildStageCollection;
