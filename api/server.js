// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
require('dotenv').config();

const Hapi = require('hapi');

const routes = require('./lib/routes');
const plugins = require('./lib/plugins');
const config = require('./lib/settings');
const security = require('./lib/infrastructure/security');

const server = new Hapi.Server({
  routes: {
    cors: {
      origin: ['*'],
      additionalHeaders:['X-Requested-With']
    }
  },
  router: {
    isCaseSensitive: false,
    stripTrailingSlash: true
  },
  port: config.port,
});

server.auth.scheme('jwt-access-token', security.scheme);
server.auth.strategy('default', 'jwt-access-token');
server.auth.default('default');

server.register(plugins);
routes.forEach(route => route.register(server, config, () => null));

module.exports = server;
