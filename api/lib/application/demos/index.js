const demoController = require('./demo-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/courses/{id}',
      config: {
        auth: false,
        handler: demoController.get,
        tags: ['api']
      }
    },
  ]);
};

exports.name = 'demos-api';
