import { MonitoredJobHandler } from './src/shared/infrastructure/jobs/monitoring/MonitoredJobHandler.js';
import { logger } from './src/shared/infrastructure/utils/logger.js';

function main() {
  new MonitoredJobHandler({ name: 'test-job-failed' }, logger).logJobFailed({ testId: 1234 }, new Error('This is a test error message'));
}

main();
