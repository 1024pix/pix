import { config } from '../config.js';

const CONCURRENCY_HEAVY_OPERATIONS = config.infra.concurrencyForHeavyOperations;

const ORGANIZATION_LEARNER_CHUNK_SIZE = config.infra.chunkSizeForOrganizationLearnerDataProcessing;

const constants = {
  CONCURRENCY_HEAVY_OPERATIONS,
  ORGANIZATION_LEARNER_CHUNK_SIZE,
};

export { CONCURRENCY_HEAVY_OPERATIONS, constants, ORGANIZATION_LEARNER_CHUNK_SIZE };
