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
    {
      method: 'POST',
      path: '/api/cnav/users',
      config: {
        auth: false,
        handler: cnavController.createUser,
        notes: [
          '- Cette route permet de créer un compte Pix pour un utilisateur provenant de la CNAV.\n' +
            "- Elle retournera un access token Pix correspondant à l'utilisateur.",
        ],
        tags: ['api', 'CNAV'],
      },
    },
  ]);
};

exports.name = 'cnav-api';
