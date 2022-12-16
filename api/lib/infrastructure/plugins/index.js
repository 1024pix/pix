const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const config = require('../../config');

const plugins = [
  Inert,
  Vision,
  require('./i18n'),
  require('./pino'),
  ...(config.sentry.enabled ? [require('./sentry')] : []),
];

module.exports = plugins;
