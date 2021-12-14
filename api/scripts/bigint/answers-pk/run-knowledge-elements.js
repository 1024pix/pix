require('dotenv').config();
const { runKnowledgeElements } = require('./runner');
const logger = require('../../../lib/infrastructure/logger');

(async () => {
  try {
    await runKnowledgeElements();
    process.exit(0);
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
})();
