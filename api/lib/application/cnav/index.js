const cnavController = require('./cnav-controller');

exports.register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/cnav/auth-url',
      config: {
        auth: false,
        handler: cnavController.getAuthUrl,
        notes: [
          "- Cette route permet de récupérer l'url d'authentification de la CNAV.\n" +
            '- Elle retournera également les valeurs state et nonce.',
        ],
        tags: ['api', 'CNAV'],
      },
    },
  ]);
};

exports.name = 'cnav-api';
