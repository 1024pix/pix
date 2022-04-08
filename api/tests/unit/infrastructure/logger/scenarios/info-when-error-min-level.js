// given
const settings = require('../../../../../lib/config');
settings.logging.enabled = true;
settings.logging.logLevel = 'error';
settings.logging.logForHumans = false;
const logger = require('../../../../../lib/infrastructure/logger');

// when
logger.info('message');
