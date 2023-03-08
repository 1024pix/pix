const dotenv = require('dotenv');
dotenv.config();
const Hapi = require('@hapi/hapi');
const Oppsy = require('oppsy');

const settings = require('./lib/config');
const preResponseUtils = require('./lib/application/pre-response-utils');

const { routes } = require('./lib/routes');
const plugins = require('./lib/infrastructure/plugins');
const swaggers = require('./lib/swaggers');
const authentication = require('./lib/infrastructure/authentication');

const { handleFailAction } = require('./lib/validate');
const monitoringTools = require('./lib/infrastructure/monitoring-tools');
const deserializer = require('./lib/infrastructure/serializers/jsonapi/deserializer');
const { knex } = require('./db/knex-database-connection');
const { port, logging } = require('./lib/config');

monitoringTools.installHapiHook();

const createServer = async () => {
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

module.exports = createServer;
