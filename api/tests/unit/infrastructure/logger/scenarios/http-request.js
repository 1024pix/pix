// given
const settings = require('../../../../../lib/config');
settings.logging.enabled = true;
settings.logging.logLevel = 'info';
settings.logging.logForHumans = false;
const logger = require('../../../../../lib/infrastructure/logger');

const request = {
  method: 'GET',
  headers: {
    type: 'JSON',
    authorization: 'foo',
  },
};

// when
logger.info({ req: request });
