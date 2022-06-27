const redis = require('redis');
const { promisify } = require('util');
const logger = require('../logger');

module.exports = function createRedisRateLimit(redisUrl) {
  const client = redis.createClient(redisUrl);
  client.scriptAsync = promisify(client.script).bind(client);
  client.evalshaAsync = promisify(client.evalsha).bind(client);
  client.on('error', (err) => logger.warn({ redisClient: 'rate-limit', err }, 'Error encountered'));
  return client;
};
