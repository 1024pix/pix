// Usage
// LOG_LEVEL=<LEVEL> PROCEED=<CHOICE> node scripts/run-neutralize-answers-after-invalid-challenges.js
//
// - LEVEL=debug is the most verbose one
// - PROCEED : No changes are made unless PROCEED environment variable is set to YES : PROCEED=YES node scripts/run-neutralize-answers-after-invalid-challenges.js
'use strict';
require('dotenv').config({ path: `${__dirname}/../.env` });
const logger = require('../lib/infrastructure/logger');
const { main } = require('./neutralize-answers-after-invalid-challenges');

(async () => {
  try {
    logger.info('Script has started');
    await main();
    logger.info('Script has ended');
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
  process.exit(0);
})();
