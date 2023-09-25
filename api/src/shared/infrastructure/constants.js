import { config } from '../config.js';

const CONCURRENCY_HEAVY_OPERATIONS = config.infra.concurrencyForHeavyOperations;

const constants = {
  CONCURRENCY_HEAVY_OPERATIONS,
};

export { constants, CONCURRENCY_HEAVY_OPERATIONS };
