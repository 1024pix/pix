import os from 'node:os';

import Boom from '@hapi/boom';

import { databaseConnections } from '../../../../db/database-connections.js';
import packageJSON from '../../../../package.json' with { type: 'json' };
import { config } from '../../config.js';
import { getBaseLocale } from '../../domain/services/locale-service.js';
import * as network from '../../infrastructure/utils/network.js';
import { redisMonitor } from '../../infrastructure/utils/redis-monitor.js';
import { getChallengeLocale } from '../../infrastructure/utils/request-response-utils.js';

const get = function (request) {
  const locale = getChallengeLocale(request);

  return {
    name: packageJSON.name,
    version: packageJSON.version,
    description: packageJSON.description,
    environment: config.environment,

    'container-version': process.env.CONTAINER_VERSION,

    'container-app-name': process.env.APP,
    'current-lang': getBaseLocale(locale),
  };
};

const checkDbStatus = async function () {
  try {
    await databaseConnections.checkStatuses();
    return { message: 'Connection to databases ok' };
  } catch (error) {
    throw Boom.serverUnavailable(`Connection to databases failed: ${error.message}`);
  }
};

const checkRedisStatus = async function () {
  try {
    await redisMonitor.ping();
    return { message: 'Connection to Redis ok' };
  } catch {
    throw Boom.serverUnavailable('Connection to Redis failed');
  }
};

const checkForwardedOriginStatus = async function (request, h) {
  let forwardedOrigin;
  try {
    // network.getForwardedOrigin throws ForwardedOriginError which maps to a HTTP status code 400,
    // but for monitoring purpose we want this error to produce a 500.
    forwardedOrigin = network.getForwardedOrigin(request.headers);
  } catch {
    return h.response('Obtaining Forwarded Origin failed').code(500);
  }

  return h.response(forwardedOrigin).code(200);
};

const checkOsStatus = function () {
  return {
    type: os.type(),
    version: os.version(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
  };
};

const healthcheckController = { get, checkDbStatus, checkRedisStatus, checkForwardedOriginStatus, checkOsStatus };

export { healthcheckController };
