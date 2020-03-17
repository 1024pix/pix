const Boom = require('boom');
const packageJSON = require('../../../package.json');
const settings = require('../../config');
const redisMonitor = require('../../infrastructure/utils/redis-monitor');
const { knex } = require('../../../db/knex-database-connection');

module.exports = {

  get() {
    return {
      'name': packageJSON.name,
      'version': packageJSON.version,
      'description': packageJSON.description,
      'environment': settings.environment,
      'container-version': process.env.CONTAINER_VERSION,
      'container-app-name': process.env.APP,
    };
  },

  async checkDbStatus() {
    try {
      await knex.raw('SELECT 1 FROM knex_migrations_lock');
      return { message: 'Connection to database ok' };
    } catch (err) {
      throw Boom.serverUnavailable('Connection to database failed');
    }
  },

  async checkRedisStatus() {
    try {
      await redisMonitor.ping();
      return { message: 'Connection to Redis ok' };
    } catch (err) {
      throw Boom.serverUnavailable('Connection to Redis failed');
    }
  },

  crashTest() {
    throw Boom.internal();
  },
};
