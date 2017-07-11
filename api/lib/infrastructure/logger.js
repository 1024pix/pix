const bunyan = require('bunyan');
const settings = require('../settings');

const logger = bunyan.createLogger({ name: 'pix-api', streams: [] });

if (settings.logging.enabled) {

  logger.addStream({
    name: 'standard-output',
    stream: process.stdout,
    level: 'info'
  });

  logger.addStream({
    name: 'file-output',
    path: settings.logging.path,
    level: 'warn',
    type: 'rotating-file',
    period: '1d',
    count: 5
  });

}

module.exports = logger;

