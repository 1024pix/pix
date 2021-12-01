const TubesController = require('./tubes-controller');

exports.register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/framework/tubes',
      config: {
        handler: TubesController.getTubes,
        tags: ['api', 'framework', 'tubes'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          'Elle permet de demander de récupérer tous les sujets du référentiel',
        ],
      },
    },
  ]);
};

exports.name = 'tubes-api';
