const Hapi = require('hapi');

const config = require('./config/settings');
const plugins = require('./config/plugins');
const routes = require('./config/routes');

const server = new Hapi.Server();
server.connection({ port: config.port });

server.register(plugins, (err) => {

  if (err) {
    throw err; // something bad happened loading the plugin
  }

  server.start((err) => {

    if (err) {
      throw err;
    }
    server.log('info', 'Server running at: ' + server.info.uri);
  });
});

server.route(routes);

module.exports = server;

