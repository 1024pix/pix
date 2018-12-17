const correctionsController = require('./corrections-controller');

exports.register = async function(server) {
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
};

exports.name = 'corrections-api';
