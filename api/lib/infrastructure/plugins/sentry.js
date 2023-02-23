const hapiSentry = require('hapi-sentry');
const Pack = require('../../../package');
const config = require('../../config');

module.exports = {
  plugin: hapiSentry,
  options: {
    client: {
      dsn: config.sentry.dsn,
      environment: config.sentry.environment,
      release: `v${Pack.version}`,
      maxBreadcrumbs: config.sentry.maxBreadcrumbs,
      debug: config.sentry.debug,
      maxValueLength: config.sentry.maxValueLength,
    },
    scope: {
      tags: [{ name: 'source', value: 'api' }],
    },
  },
};
