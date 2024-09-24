import { config } from '../config.js';

const CONCURRENCY_HEAVY_OPERATIONS = config.infra.concurrencyForHeavyOperations;

const ORGANIZATION_LEARNER_CHUNK_SIZE = config.infra.chunkSizeForOrganizationLearnerDataProcessing;

const CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING = config.infra.chunkSizeForCampaignResultProcessing;

export { CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING, CONCURRENCY_HEAVY_OPERATIONS, ORGANIZATION_LEARNER_CHUNK_SIZE };
