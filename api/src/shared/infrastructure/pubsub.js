import { createRedisEventTarget } from '@graphql-yoga/redis-event-target';
import { createPubSub } from '@graphql-yoga/subscription';
import { Redis } from 'ioredis';

import { config } from '../config.js';
import { child } from './utils/logger.js';

const logger = child('pubsub', { event: 'pubsub' });

/**
 * @typedef {import('@graphql-yoga/subscription').PubSub<{
 *   [key: string]: [message: any]
 * }>} PubSub
 */

/** @type {PubSub} */
let pubSub;

/** @type {import('ioredis').Redis} */
let publishClient;
/** @type {import('ioredis').Redis} */
let subscribeClient;

function getPubSub() {
  if (pubSub) return pubSub;

  try {
    if (!config.caching.redisUrl) {
      pubSub = createPubSub();
      return pubSub;
    }

    publishClient = new Redis(config.caching.redisUrl);
    publishClient.on('error', (err) => logger.error({ err }, 'PubSub : error in Publish client'));

    subscribeClient = new Redis(config.caching.redisUrl);
    subscribeClient.on('error', (err) => logger.error({ err }, 'PubSub : error in Subscribe client'));

    pubSub = createPubSub({
      eventTarget: createRedisEventTarget({
        publishClient,
        subscribeClient,
      }),
    });

    return pubSub;
  } catch (err) {
    logger.error({ err }, `error while creating PubSub`);
    throw err;
  }
}

/**
 * @typedef {{
 *   publish(message: any): void
 *   subscribe(callback: (message: any) => any | Promise<any>): void
 * }} Topic
 */

/**
 * @param {string} topicName
 * @returns {Topic}
 */
export function getTopic(topicName, pubSub = getPubSub()) {
  return {
    publish: (message) => pubSub.publish(topicName, message),

    subscribe: (callback) => {
      (async () => {
        try {
          for await (const message of pubSub.subscribe(topicName)) {
            try {
              await callback(message);
            } catch (err) {
              logger.error({ topicName, err }, 'error while handling message');
            }
          }
        } catch (err) {
          logger.error({ topicName, err }, 'error while subscribing to topic');
        }
      })();
    },
  };
}

export async function close() {
  await publishClient?.quit();
  await subscribeClient?.quit();
}
