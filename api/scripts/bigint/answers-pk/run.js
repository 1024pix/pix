require('dotenv').config();
const { run } = require('./runner');
const logger = require('../../../lib/infrastructure/logger');

(async () => {
  try {
    await run();
    process.exit(0);
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
})();
