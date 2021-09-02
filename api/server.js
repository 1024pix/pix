require('dotenv').config();

const Hapi = require('@hapi/hapi');

const preResponseUtils = require('./lib/application/pre-response-utils');

const routes = require('./lib/routes');
const plugins = require('./lib/plugins');
const swaggers = require('./lib/swaggers');
const authentication = require('./lib/infrastructure/authentication');

const { handleFailAction } = require('./lib/validate');
const { asyncLocalStorage } = require('./lib/infrastructure/performance-tools');

const Request = require('@hapi/hapi/lib/request');
const originalMethod = Request.prototype._execute;

Request.prototype._execute = function(...args) {
  const request = this;
  return asyncLocalStorage.run(request, () => originalMethod.call(request, args));
};

let config;

const setupServer = async () => {

  loadConfiguration();

  const server = await createServer();

  setupErrorHandling(server);

  setupAuthentication(server);

  await setupRoutesAndPlugins(server);

  await setupOpenApiSpecification(server);

  return server;
};

const createServer = async function() {

  const serverConfiguration = {
    compression: false,
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

const loadConfiguration = function() {
  config = require('./lib/config');
};

const setupErrorHandling = function(server) {
  server.ext('onPreResponse', preResponseUtils.handleDomainAndHttpErrors);
};

const setupAuthentication = function(server) {
  server.auth.scheme(authentication.schemeName, authentication.scheme);
  authentication.strategies.map((strategy) => {
    server.auth.strategy(strategy.name, authentication.schemeName, strategy.configuration);
  });
  server.auth.default(authentication.defaultStrategy);
};

const setupRoutesAndPlugins = async function(server) {
  const configuration = [].concat(plugins, routes);
  await server.register(configuration);
};

const setupOpenApiSpecification = async function(server) {
  for (const swaggerRegisterArgs of swaggers) {
    await server.register(...swaggerRegisterArgs);
  }
};

module.exports = setupServer;
