// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
require('dotenv').config();

const Hapi = require('hapi');

const routes = require('./lib/routes');
const plugins = require('./lib/plugins');
const config = require('./lib/settings');
const security = require('./lib/infrastructure/security');

const createServer = async () => {

  const server = new Hapi.server({
    routes: {
      cors: {
        origin: ['*'],
        additionalHeaders: ['X-Requested-With']
      }
    },
    port: config.port,
    router: {
      isCaseSensitive: false,
      stripTrailingSlash: true
    }
  });

  server.auth.scheme('jwt-access-token', security.scheme);
  server.auth.strategy('default', 'jwt-access-token');
  server.auth.default('default');

  const configuration = [].concat(plugins, routes);

  await server.register(configuration);

  return server;
};

module.exports = createServer;
