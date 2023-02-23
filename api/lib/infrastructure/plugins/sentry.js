const hapiSentry = require('hapi-sentry');
const packageJSON = require('../../../package.json');
const config = require('../../config.js');

module.exports = {
  plugin: hapiSentry,
  options: {
    client: {
      dsn: config.sentry.dsn,
      environment: config.sentry.environment,
      release: `v${packageJSON.version}`,
      maxBreadcrumbs: config.sentry.maxBreadcrumbs,
      debug: config.sentry.debug,
      maxValueLength: config.sentry.maxValueLength,
    },
    scope: {
      tags: [{ name: 'source', value: 'api' }],
    },
  },
};
