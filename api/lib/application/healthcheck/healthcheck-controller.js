import Boom from 'boom';
import packageJSON from '../../../package.json';
import settings from '../../config';
import redisMonitor from '../../infrastructure/utils/redis-monitor';
import { knex } from '../../../db/knex-database-connection';

export default {
  get(request) {
    return {
      name: packageJSON.name,
      version: packageJSON.version,
      description: packageJSON.description,
      environment: settings.environment,
      // eslint-disable-next-line node/no-process-env
      'container-version': process.env.CONTAINER_VERSION,
      // eslint-disable-next-line node/no-process-env
      'container-app-name': process.env.APP,
      'current-lang': request.i18n.__('current-lang'),
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
};
