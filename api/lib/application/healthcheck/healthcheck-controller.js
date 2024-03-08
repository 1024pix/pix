import Boom from '@hapi/boom';

import { knex } from '../../../db/knex-database-connection.js';
import packageJSON from '../../../package.json' assert { type: 'json' };
import { config } from '../../config.js';
import { redisMonitor } from '../../infrastructure/utils/redis-monitor.js';

const get = function (request) {
  return {
    name: packageJSON.name,
    version: packageJSON.version,
    description: packageJSON.description,
    environment: config.environment,
    // eslint-disable-next-line n/no-process-env
    'container-version': process.env.CONTAINER_VERSION,
    // eslint-disable-next-line n/no-process-env
    'container-app-name': process.env.APP,
    'current-lang': request.i18n.__('current-lang'),
  };
};

const checkDbStatus = async function () {
  try {
    await knex.raw('SELECT 1 FROM knex_migrations_lock');
    return { message: 'Connection to database ok' };
  } catch (err) {
    throw Boom.serverUnavailable('Connection to database failed');
  }
};

const checkRedisStatus = async function () {
  try {
    await redisMonitor.ping();
    return { message: 'Connection to Redis ok' };
  } catch (err) {
    throw Boom.serverUnavailable('Connection to Redis failed');
  }
};

const healthcheckController = { get, checkDbStatus, checkRedisStatus };

export { healthcheckController };
