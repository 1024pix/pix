import Pack from '../../../package';
import config from '../../config';

export default {
  plugin: require('hapi-sentry'),
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
