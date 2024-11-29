import { createRedisEventTarget } from '@graphql-yoga/redis-event-target';
import { createPubSub } from '@graphql-yoga/subscription';
import { Redis } from 'ioredis';

import { config } from '../../config.js';

/**
 * @typedef {import('@graphql-yoga/subscription').PubSub<{
 *   [key: string]: [message: object]
 * }>} LearningContentPubSub
 */

/** @type {LearningContentPubSub} */
let pubSub;

/** @type {import('ioredis').Redis} */
let publishClient;
/** @type {import('ioredis').Redis} */
let subscribeClient;

export function getPubSub() {
  if (pubSub) return pubSub;

  if (!config.caching.redisUrl) {
    pubSub = createPubSub();
    return pubSub;
  }

  publishClient = new Redis(config.caching.redisUrl);
  subscribeClient = new Redis(config.caching.redisUrl);

  pubSub = createPubSub({
    eventTarget: createRedisEventTarget({
      publishClient,
      subscribeClient,
    }),
  });

  return pubSub;
}

export async function quit() {
  await publishClient?.quit();
  await subscribeClient?.quit();
}
