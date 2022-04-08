// given
const settings = require('../../../../../lib/config');
settings.logging.enabled = false;
const logger = require('../../../../../lib/infrastructure/logger');

// when
logger.error('message');
