const courseController = require('./course-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/courses',
      config: {
        auth: false,
        handler: courseController.list,
        tags: ['api']
      }
    }, {
      method: 'GET',
      path: '/api/courses/{id}',
      config: {
        auth: false,
        handler: courseController.get,
        tags: ['api']
      }
    }, {
      method: 'POST',
      path: '/api/courses',
      config: {
        handler: courseController.save,
        tags: ['api']
      }
    }
  ]);
};

exports.name = 'courses-api';
