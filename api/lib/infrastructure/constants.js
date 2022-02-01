const settings = require('../config');

module.exports = {
  CONCURRENCY_HEAVY_OPERATIONS: settings.infra.concurrencyForHeavyOperations,
  CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING: settings.infra.chunkSizeForCampaignResultProcessing,
  SCHOOLING_REGISTRATION_CHUNK_SIZE: settings.infra.chunkSizeForSchoolingRegistrationDataProcessing,
};
