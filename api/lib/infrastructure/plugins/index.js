const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const config = require('../../config');

const plugins = [
  Inert,
  Vision,
  require('./i18n'),
  require('./hapi-pino'),
  require('./rate-limit'),
  ...(config.sentry.enabled ? [require('./sentry')] : []),
];

module.exports = plugins;
