import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import packageJSON from '../../../../package.json' with { type: 'json' };
import { config } from '../../config.js';

// Ensure to call this before requiring any other modules!
Sentry.init({
  dsn: config.sentry.dsn,
  environment: config.sentry.environment,
  maxBreadcrumbs: config.sentry.maxBreadcrumbs,
  debug: config.sentry.debug,
  maxValueLength: config.sentry.maxValueLength,
  release: `v${packageJSON.version}`,
  scope: {
    tags: [{ name: 'source', value: 'api' }],
  },
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],

  tracesSampleRate: config.sentry.tracesSampleRate,
  profilesSampleRate: config.sentry.profilesSampleRate,
});
