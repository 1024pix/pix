const godmodeController = require('./godmode-controller');
const godmodeAuthorization = require('../preHandlers/godmode-authorization');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/godmode/info-challenges/{id}',
      config: {
        auth: false,
        pre: [{
          method: godmodeAuthorization.verify,
        }],
        handler: godmodeController.getInfoChallenge,
        notes: [
          '- Exclusivité godmode : récupération des informations d\'un challenge',
        ],
        tags: ['api', 'godmode', 'info-challenge'],
      },
    },
  ]);
};

exports.name = 'info-challenges-api';
