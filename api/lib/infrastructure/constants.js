const settings = require('../config');

module.exports = {
  CONCURRENCY_HEAVY_OPERATIONS: settings.infra.concurrencyForHeavyOperations,
};
