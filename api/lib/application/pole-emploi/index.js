const poleEmploiController = require('./pole-emploi-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/pole-emploi/users',
      config: {
        auth: false,
        handler: poleEmploiController.createUser,
        tags: ['api'],
      },
    },
  ]);
};

exports.name = 'pole-emplois-api';
