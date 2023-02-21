import Pack from '../../../package.json' assert { type: 'json' };
import config from '../../config';
import hapiSentry from 'hapi-sentry';

export default {
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
