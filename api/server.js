// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
require('dotenv').config();

const Hapi = require('hapi');

const routes = require('./lib/routes');
const plugins = require('./lib/plugins');
const config = require('./lib/settings');
const logger = require('./lib/infrastructure/logger');
const security = require('./lib/infrastructure/security');

const server = new Hapi.Server({
  connections: {
    routes: {
      cors: true
    },
    router: {
      isCaseSensitive: false,
      stripTrailingSlash: true
    }
  },
});

server.connection({ port: config.port });

server.auth.scheme('jwt-access-token', security.scheme);
server.auth.strategy('default', 'jwt-access-token');
server.auth.default('default');

const configuration = [].concat(plugins, routes);

server.register(configuration, (err) => {
  if (err) logger.error(err);
});

module.exports = server;
