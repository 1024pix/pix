// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
require('dotenv').config();

const Hapi = require('@hapi/hapi');

const { DomainError } = require('./lib/domain/errors');
const { InfrastructureError } = require('./lib/infrastructure/errors');
const errorManager = require('./lib/infrastructure/utils/error-manager');

const routes = require('./lib/routes');
const plugins = require('./lib/plugins');
const config = require('./lib/config');
const security = require('./lib/infrastructure/security');

const createServer = async () => {

  const server = new Hapi.server({
    routes: {
      cors: {
        origin: ['*'],
        additionalHeaders: ['X-Requested-With']
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

  function handleErrors(request, h) {
    const { response } = request;

    if (response instanceof DomainError || response instanceof InfrastructureError) {
      return errorManager.send(h, response);
    }

    return h.continue;
  }

  server.ext('onPreResponse', handleErrors);

  server.auth.scheme('jwt-access-token', security.scheme);
  server.auth.strategy('default', 'jwt-access-token');
  server.auth.default('default');

  await server.register([...plugins, ...routes]);

  return server;
};

module.exports = createServer;
