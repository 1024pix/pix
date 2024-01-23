import { config } from '../config.js';

const CONCURRENCY_HEAVY_OPERATIONS = config.infra.concurrencyForHeavyOperations;
const CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING = config.infra.chunkSizeForCampaignResultProcessing;

const constants = {
  CONCURRENCY_HEAVY_OPERATIONS,
  CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING,
};

export { constants, CONCURRENCY_HEAVY_OPERATIONS, CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING };
