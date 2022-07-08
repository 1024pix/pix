const redis = require('redis');
const { promisify } = require('util');
const logger = require('../logger');
const settings = require('../../config');
const redisRateLimiter = settings.rateLimit.redisUrl ? buildRedisRateLimiter() : null;

function buildRedisRateLimiter() {
  const rateLimiter = redis.createClient(settings.rateLimit.redisUrl);
  rateLimiter.scriptAsync = promisify(rateLimiter.script).bind(rateLimiter);
  rateLimiter.evalshaAsync = promisify(rateLimiter.evalsha).bind(rateLimiter);
  rateLimiter.on('error', (err) => logger.warn({ redisClient: 'rate-limit', err }, 'Error encountered'));
  return rateLimiter;
}

module.exports = redisRateLimiter;
