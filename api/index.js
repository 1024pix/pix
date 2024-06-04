import 'dotenv/config';

import { validateEnvironmentVariables } from './lib/infrastructure/validate-environment-variables.js';

validateEnvironmentVariables();

import { disconnect } from './db/knex-database-connection.js';
import { learningContentCache } from './lib/infrastructure/caches/learning-content-cache.js';
import { logErrorWithCorrelationIds, logInfoWithCorrelationIds } from './lib/infrastructure/monitoring-tools.js';
import { temporaryStorage } from './lib/infrastructure/temporary-storage/index.js';
import { redisMonitor } from './lib/infrastructure/utils/redis-monitor.js';
import { createServer } from './server.js';

let server;

const start = async function () {
  server = await createServer();
  await server.start();
};

async function _exitOnSignal(signal) {
  logInfoWithCorrelationIds(`Received signal: ${signal}.`);
  logInfoWithCorrelationIds('Stopping HAPI server...');
  await server.stop({ timeout: 30000 });
  if (server.oppsy) {
    logInfoWithCorrelationIds('Stopping HAPI Oppsy server...');
    await server.oppsy.stop();
  }
  logInfoWithCorrelationIds('Closing connexions to database...');
  await disconnect();
  logInfoWithCorrelationIds('Closing connexions to cache...');
  await learningContentCache.quit();
  logInfoWithCorrelationIds('Closing connexions to temporary storage...');
  await temporaryStorage.quit();
  logInfoWithCorrelationIds('Closing connexions to redis monitor...');
  await redisMonitor.quit();
  logInfoWithCorrelationIds('Exiting process...');
}

process.on('SIGTERM', () => {
  _exitOnSignal('SIGTERM');
});
process.on('SIGINT', () => {
  _exitOnSignal('SIGINT');
});

(async () => {
  try {
    await start();
    if (process.env.START_JOB_IN_WEB_PROCESS) {
      import('./worker.js');
    }
  } catch (error) {
    logErrorWithCorrelationIds(error);
    throw error;
  }
})();
