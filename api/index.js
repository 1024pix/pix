require('dotenv').config();
const validateEnvironmentVariables = require('./lib/infrastructure/validate-environement-variables');
validateEnvironmentVariables();

const createServer = require('./server');
const logger = require('./lib/infrastructure/logger');
const { disconnect } = require('./db/knex-database-connection');
const cache = require('./lib/infrastructure/caches/learning-content-cache');
const temporaryStorage = require('./lib/infrastructure/temporary-storage/index');
const redisMonitor = require('./lib/infrastructure/utils/redis-monitor');
const redisRateLimiter = require('./lib/infrastructure/utils/redis-rate-limiter');

let server;

const start = async function () {
  server = await createServer();
  await server.start();
};

async function _exitOnSignal(signal) {
  logger.info(`Received signal: ${signal}.`);
  logger.info('Stopping HAPI server...');
  await server.stop({ timeout: 30000 });
  logger.info('Closing connexions to database...');
  await disconnect();
  logger.info('Closing connexions to cache...');
  cache.quit();
  logger.info('Closing connexions to temporary storage...');
  temporaryStorage.quit();
  logger.info('Closing connexions to redis monitor...');
  redisMonitor.quit();
  logger.info('Closing connexions to redis rate limiter...');
  redisRateLimiter.quit();
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
  } catch (error) {
    logger.error(error);
    throw error;
  }
})();
