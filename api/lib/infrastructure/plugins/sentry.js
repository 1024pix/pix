import hapiSentry from 'hapi-sentry';

import packageJSON from '../../../package.json' with { type: 'json' };
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

export { options, plugin };
