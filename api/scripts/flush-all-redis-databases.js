import { createClient } from '@redis/client';

import { config } from '../config/config.js';
import { logger } from '../src/shared/infrastructure/utils/logger.js';

const client = createClient({ url: config.redisUrl });

try {
  await client.connect();
  await client.flushAll();

  logger.info('Flushed all Redis databases');
} finally {
  await client.close();
}
