require('dotenv').config();
import Hapi from '@hapi/hapi';
import Oppsy from 'oppsy';
import settings from './lib/config';
import preResponseUtils from './lib/application/pre-response-utils';
import routes from './lib/routes';
import plugins from './lib/infrastructure/plugins';
import swaggers from './lib/swaggers';
import authentication from './lib/infrastructure/authentication';
import { handleFailAction } from './lib/validate';
import monitoringTools from './lib/infrastructure/monitoring-tools';
import deserializer from './lib/infrastructure/serializers/jsonapi/deserializer';
import { knex } from './db/knex-database-connection';

monitoringTools.installHapiHook();

let config;

const createServer = async () => {
  loadConfiguration();

  const server = createBareServer();

  if (settings.logOpsMetrics) await enableOpsMetrics(server);

  setupErrorHandling(server);

  setupAuthentication(server);

  await setupRoutesAndPlugins(server);

  await setupOpenApiSpecification(server);

  setupDeserialization(server);

  return server;
};

const createBareServer = function () {
  const serverConfiguration = {
    compression: false,
    debug: { request: false, log: false },
    routes: {
      validate: {
        failAction: handleFailAction,
      },
      cors: {
        origin: ['*'],
        additionalHeaders: ['X-Requested-With'],
      },
      response: {
        emptyStatusCode: 204,
      },
    },
    port: config.port,
    router: {
      isCaseSensitive: false,
      stripTrailingSlash: true,
    },
  };

  return new Hapi.server(serverConfiguration);
};

const enableOpsMetrics = async function (server) {
  const oppsy = new Oppsy(server);

  oppsy.on('ops', (data) => {
    const knexPool = knex.client.pool;
    server.log(['ops'], {
      ...data,
      knexPool: {
        used: knexPool.numUsed(),
        free: knexPool.numFree(),
        pendingAcquires: knexPool.numPendingAcquires(),
        pendingCreates: knexPool.numPendingCreates(),
      },
    });
  });

  oppsy.start(config.logging.emitOpsEventEachSeconds * 1000);
  server.oppsy = oppsy;
};

const loadConfiguration = function () {
  config = require('./lib/config');
};

const setupErrorHandling = function (server) {
  server.ext('onPreResponse', preResponseUtils.handleDomainAndHttpErrors);
};

const setupDeserialization = function (server) {
  server.ext('onPreHandler', async (request, h) => {
    if (request.payload?.data) {
      request.deserializedPayload = await deserializer.deserialize(request.payload);
    }
    return h.continue;
  });
};

const setupAuthentication = function (server) {
  server.auth.scheme(authentication.schemeName, authentication.scheme);
  authentication.strategies.forEach((strategy) => {
    server.auth.strategy(strategy.name, authentication.schemeName, strategy.configuration);
  });
  server.auth.default(authentication.defaultStrategy);
};

const setupRoutesAndPlugins = async function (server) {
  const configuration = [].concat(plugins, routes);
  await server.register(configuration);
};

const setupOpenApiSpecification = async function (server) {
  for (const swaggerRegisterArgs of swaggers) {
    await server.register(...swaggerRegisterArgs);
  }
};

export default createServer;
