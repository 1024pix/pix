// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
require('dotenv').config();
const validateEnvironmentVariables = require('./lib/infrastructure/validate-environement-variables');
const Hapi = require('@hapi/hapi');

const preResponseUtils = require('./lib/application/pre-response-utils');

const routes = require('./lib/routes');
const plugins = require('./lib/plugins');
const swaggers = require('./lib/swaggers');
const config = require('./lib/config');

const { find } = require('lodash');
const security = require('./lib/infrastructure/security');

const { handleFailAction } = require('./lib/validate');

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

const createServer = async () => {

  validateEnvironmentVariables();

  const server = new Hapi.server({
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
  });

  server.ext('onPreResponse', preResponseUtils.handleDomainAndHttpErrors);

  server.auth.scheme('jwt-scheme', security.scheme);

  server.auth.strategy('jwt-livret-scolaire', 'jwt-scheme', {
    //TODO rename var env to clientApplicationAuthentication
    key: config.livretScolaireAuthentication.secret,
    validate: validateClientApplication,
  });

  server.auth.strategy('jwt-user', 'jwt-scheme', {
    key: config.authentication.secret,
    validate: validateUser,
  });

  server.auth.default('jwt-user');

  const configuration = [].concat(plugins, routes);

  await server.register(configuration);

  for (const swaggerRegisterArgs of swaggers) {
    await server.register(...swaggerRegisterArgs);
  }

  return server;
};

module.exports = createServer;
