// given
const settings = require('../../../../../lib/config');
settings.logging.enabled = true;
settings.logging.logLevel = 'info';
settings.logging.logForHumans = true;
const logger = require('../../../../../lib/infrastructure/logger');

// when
logger.info('message');
