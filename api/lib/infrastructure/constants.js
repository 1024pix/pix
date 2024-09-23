import { config } from '../../src/shared/config.js';

const CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING = config.infra.chunkSizeForCampaignResultProcessing;

const constants = {
  CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING,
};

export { CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING, constants };
