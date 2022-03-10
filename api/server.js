require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Oppsy = require('@hapi/oppsy');

const settings = require('./lib/config');
const preResponseUtils = require('./lib/application/pre-response-utils');

const routes = require('./lib/routes');
const plugins = require('./lib/plugins');
const swaggers = require('./lib/swaggers');
const authentication = require('./lib/infrastructure/authentication');

const { handleFailAction } = require('./lib/validate');
const monitoringTools = require('./lib/infrastructure/monitoring-tools');

monitoringTools.installHapiHook();

let config;

const setupServer = async () => {
  loadConfiguration();

  const server = await createServer();

  if (settings.logOpsMetrics) await enableOpsMetrics(server);

  setupErrorHandling(server);

  setupAuthentication(server);

  await setupRoutesAndPlugins(server);

  await setupOpenApiSpecification(server);

  return server;
};

const createServer = async function () {
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
    server.log(['ops'], data);
  });

  oppsy.start(config.logging.emitOpsEventEachSeconds * 1000);
};

const loadConfiguration = function () {
  config = require('./lib/config');
};

const setupErrorHandling = function (server) {
  server.ext('onPreResponse', preResponseUtils.handleDomainAndHttpErrors);
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

module.exports = setupServer;
