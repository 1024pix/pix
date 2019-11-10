const courseController = require('./course-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/courses/{id}',
      config: {
        auth: false,
        handler: courseController.get,
        tags: ['api']
      }
    },
  ]);
};

exports.name = 'courses-api';
