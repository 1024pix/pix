import hapiSentry from 'hapi-sentry';
const packageJSON = require('../../../package.json');
import { config } from '../../config.js';

const plugin = hapiSentry;
const options = {
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
};

export { plugin, options };
