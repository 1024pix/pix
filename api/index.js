const dotenv = require('dotenv');
dotenv.config();
const validateEnvironmentVariables = require('./lib/infrastructure/validate-environment-variables');
validateEnvironmentVariables();

const createServer = require('./server');
const logger = require('./lib/infrastructure/logger');
const { disconnect } = require('./db/knex-database-connection');
const cache = require('./lib/infrastructure/caches/learning-content-cache');
const { temporaryStorage } = require('./lib/infrastructure/temporary-storage/index');
const redisMonitor = require('./lib/infrastructure/utils/redis-monitor');

let server;

const start = async function () {
  server = await createServer();
  await server.start();
};

async function _exitOnSignal(signal) {
  logger.info(`Received signal: ${signal}.`);
  logger.info('Stopping HAPI server...');
  await server.stop({ timeout: 30000 });
  if (server.oppsy) {
    logger.info('Stopping HAPI Oppsy server...');
    await server.oppsy.stop();
  }
  logger.info('Closing connexions to database...');
  await disconnect();
  logger.info('Closing connexions to cache...');
  await cache.quit();
  logger.info('Closing connexions to temporary storage...');
  await temporaryStorage.quit();
  logger.info('Closing connexions to redis monitor...');
  await redisMonitor.quit();
  logger.info('Exiting process...');
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
      require('./worker.js');
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
})();
