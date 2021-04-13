require('dotenv').config();
const validateEnvironmentVariables = require('./lib/infrastructure/validate-environement-variables');
const Hapi = require('@hapi/hapi');

const preResponseUtils = require('./lib/application/pre-response-utils');

const routes = require('./lib/routes');
const plugins = require('./lib/plugins');
const swaggers = require('./lib/swaggers');

const { find } = require('lodash');
const security = require('./lib/infrastructure/security');

const { handleFailAction } = require('./lib/validate');

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
  validateEnvironmentVariables();
  config = require('./lib/config');
};

const setupErrorHandling = function(server) {

  server.ext('onPreResponse', preResponseUtils.handleDomainAndHttpErrors);
};

const setupAuthentication = function(server) {
  const schemeName = 'jwt-scheme';
  server.auth.scheme(schemeName, security.scheme);
  server.auth.strategy('jwt-livret-scolaire', schemeName, {
    //TODO rename var env to clientApplicationAuthentication
    key: config.livretScolaireAuthentication.secret,
    validate: validateClientApplication,
  });
  server.auth.strategy('jwt-user', schemeName, {
    key: config.authentication.secret,
    validate: validateUser,
  });
  server.auth.default('jwt-user');
};

function validateClientApplication(decoded) {
  const application = find(config.graviteeRegisterApplicationsCredentials, { clientId: decoded.client_id });

  if (!application) {
    return { isValid: false, errorCode: 401 };
  }

  if (decoded.scope !== application.scope) {
    return { isValid: false, errorCode: 403 };
  }

  return { isValid: true, credentials: { client_id: decoded.clientId, scope: decoded.scope, source: decoded.source } };
}

function validateUser(decoded) {
  return { isValid: true, credentials: { userId: decoded.user_id } };
}

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
