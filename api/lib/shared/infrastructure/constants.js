import { config } from '../../config.js';

const CONCURRENCY_HEAVY_OPERATIONS = config.infra.concurrencyForHeavyOperations;
const CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING = config.infra.chunkSizeForCampaignResultProcessing;
const ORGANIZATION_LEARNER_CHUNK_SIZE = config.infra.chunkSizeForOrganizationLearnerDataProcessing;

const constants = {
  CONCURRENCY_HEAVY_OPERATIONS,
  CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING,
  ORGANIZATION_LEARNER_CHUNK_SIZE,
};

export {
  constants,
  CONCURRENCY_HEAVY_OPERATIONS,
  CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING,
  ORGANIZATION_LEARNER_CHUNK_SIZE,
};
