const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const config = require('../../config.js');
const i18n = require('./i18n.js');
const pino = require('./pino.js');
const sentry = require('./sentry.js');

const plugins = [Inert, Vision, i18n, pino, ...(config.sentry.enabled ? [sentry] : [])];

module.exports = plugins;
