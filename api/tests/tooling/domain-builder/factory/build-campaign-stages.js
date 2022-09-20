const CampaignStages = require('../../../../lib/domain/read-models/campaign/CampaignStages');

module.exports = function buildCampaignStages({ stages = [] } = {}) {
  return new CampaignStages({ stages });
};
