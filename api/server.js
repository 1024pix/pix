import dotenv from 'dotenv';
dotenv.config();
import Hapi from '@hapi/hapi';
import Oppsy from 'oppsy';

import { config } from './lib/config.js';
import { preResponseUtils } from './lib/application/pre-response-utils.js';
import { routes } from './lib/routes.js';
import { plugins } from './lib/infrastructure/plugins.js';
import { swaggers } from './lib/swaggers.js';
import { authentication } from './lib/infrastructure/authentication.js';
import { handleFailAction } from './lib/validate.js';
import { monitoringTools } from './lib/infrastructure/monitoring-tools.js';
import { deserializer } from './lib/infrastructure/serializers/jsonapi/deserializer.js';
import { knex } from './db/knex-database-connection.js';

monitoringTools.installHapiHook();

const { logOpsMetrics, port, logging } = config;
const createServer = async () => {
  const server = createBareServer();

  if (logOpsMetrics) await enableOpsMetrics(server);

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
    port,
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

  oppsy.start(logging.emitOpsEventEachSeconds * 1000);
  server.oppsy = oppsy;
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

export { createServer };
