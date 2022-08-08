const cnavController = require('./cnav-controller');

exports.register = async function (server) {
  server.route([
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
