const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const config = require('../../config');
const i18n = require('./i18n');
const pino = require('./pino');
const sentry = require('./sentry');

const plugins = [Inert, Vision, i18n, pino, ...(config.sentry.enabled ? [sentry] : [])];

module.exports = plugins;
