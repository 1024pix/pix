const config = require('../../config');
const logger = require('../logger');
const createRedisRateLimit = require('../utils/redis-rate-limiter');
const { TooManyRequestsError } = require('../../application/http-errors');

module.exports = {
  plugin: require('hapi-rate-limiter'),
  options: {
    defaultRate: () => {
      return {
        limit: config.rateLimit.limit,
        window: config.rateLimit.window,
      };
    },
    key: (request) => {
      return request.auth.credentials.userId;
    },
    redisClient: config.rateLimit.redisUrl ? createRedisRateLimit : null,
    overLimitError: (rate, request, h) => {
      logger.error({ request_id: request.headers['x-request-id'], overLimit: rate.overLimit }, 'Rate limit exceeded');
      if (config.rateLimit.logOnly) {
        return h.continue;
      } else {
        return new TooManyRequestsError(`Rate Limit Exceeded - try again in ${rate.window} seconds`);
      }
    },
    onRedisError: (err) => {
      logger.error(err);
      throw err;
    },
  },
};
