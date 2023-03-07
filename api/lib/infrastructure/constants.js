const settings = require('../config.js');

const CONCURRENCY_HEAVY_OPERATIONS = settings.infra.concurrencyForHeavyOperations;
const CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING = settings.infra.chunkSizeForCampaignResultProcessing;
const ORGANIZATION_LEARNER_CHUNK_SIZE = settings.infra.chunkSizeForOrganizationLearnerDataProcessing;

module.exports = {
  CONCURRENCY_HEAVY_OPERATIONS,
  CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING,
  ORGANIZATION_LEARNER_CHUNK_SIZE,
};
