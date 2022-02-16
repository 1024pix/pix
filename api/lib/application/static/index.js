const staticController = require('./static-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/{path*}',
      config: {
        auth: false,
        handler: staticController.get,
      },
    },
  ]);
};

exports.name = 'static-content';
