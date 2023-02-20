import settings from '../config';

export default {
  CONCURRENCY_HEAVY_OPERATIONS: settings.infra.concurrencyForHeavyOperations,
  CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING: settings.infra.chunkSizeForCampaignResultProcessing,
  ORGANIZATION_LEARNER_CHUNK_SIZE: settings.infra.chunkSizeForOrganizationLearnerDataProcessing,
};
