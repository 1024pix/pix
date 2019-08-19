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
    }, {
      method: 'POST',
      path: '/api/courses',
      config: {
        handler: courseController.save,
        notes: [
          '- **Route nécessitant une authentification**\n' +
          '- S\'il existe déjà une certification pour l\'utilisateur courant dans cette session, alors cette route renvoie la certification existante avec un code 200\n' +
          '- Sinon, crée une certification pour l\'utilisateur courant dans la session indiquée par l\'attribut *access-code*, et la renvoie avec un code 201\n'
        ],
        tags: ['api']
      }
    }
  ]);
};

exports.name = 'courses-api';
