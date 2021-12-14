require('dotenv').config();
const { runAnswers } = require('./runner');
const logger = require('../../../lib/infrastructure/logger');

(async () => {
  try {
    await runAnswers();
    process.exit(0);
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
})();
