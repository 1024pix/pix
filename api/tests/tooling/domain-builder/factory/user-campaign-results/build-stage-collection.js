const StageCollection = require('../../../../../lib/domain/models/user-campaign-results/StageCollection');

const buildStageCollection = function ({ campaignId, stages } = {}) {
  return new StageCollection({ campaignId, stages });
};

module.exports = buildStageCollection;
