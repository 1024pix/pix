const correctionsController = require('./corrections-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/corrections',
      config: {
        auth: false,
        handler: correctionsController.findByAnswerId,
        tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'corrections-api',
  version: '1.0.0'
};
