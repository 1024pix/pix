import { databaseConnectionRegistry } from '../../../db/database-connection-registry.js';
import { JobClient } from './jobs/JobClient.js';
import { quitAllStorages } from './key-value-storages/index.js';
import { stopPushingMetrics } from './metrics/pushgateway.js';
import { quitMutex } from './mutex/RedisMutex.js';
import { close as closePubSub } from './pubsub.js';
import { logger } from './utils/logger.js';
import { redisMonitor } from './utils/redis-monitor.js';

const defaultDependencies = {
  jobClient: JobClient.instance,
  databaseConnectionRegistry,
  closePubSub,
  quitAllStorages,
  quitMutex,
  redisMonitor,
  stopPushingMetrics,
  logger,
};

export function createReleaseInfrastructure(dependencies = {}) {
  const {
    jobClient,
    databaseConnectionRegistry,
    closePubSub,
    quitAllStorages,
    quitMutex,
    redisMonitor,
    stopPushingMetrics,
    logger,
  } = { ...defaultDependencies, ...dependencies };

  let isReleased = false;

  async function releaseResource(resourceName, release) {
    try {
      logger.info(`Releasing ${resourceName}...`);
      await release();
    } catch (err) {
      logger.error({ err }, `Failed to release ${resourceName}.`);
    }
  }

  return async function releaseInfrastructure() {
    if (isReleased) return;
    isReleased = true;

    await releaseResource('PG Boss client', async () => {
      if (jobClient.isInitialized) await jobClient.stop();
    });
    await releaseResource('database connections', () => databaseConnectionRegistry.disconnect());
    await releaseResource('pubsub connections', () => closePubSub());
    await releaseResource('key-value storages', () => quitAllStorages());
    await releaseResource('redis mutex', () => quitMutex());
    await releaseResource('redis monitor', () => redisMonitor.quit());
    await releaseResource('metrics pushgateway', () => stopPushingMetrics());
  };
}

export const releaseInfrastructure = createReleaseInfrastructure();
