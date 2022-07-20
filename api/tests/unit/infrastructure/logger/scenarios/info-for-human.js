const sinon = require('sinon');

// before
// eslint-disable-next-line no-restricted-syntax
const fakedDate = new Date(0);
const clock = sinon.useFakeTimers(fakedDate);

// given
const settings = require('../../../../../lib/config');
settings.logging.enabled = true;
settings.logging.logLevel = 'info';
settings.logging.logForHumans = true;
const logger = require('../../../../../lib/infrastructure/logger');

// when
logger.info('message');

// after
clock.restore();
