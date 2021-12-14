const TubesController = require('./tubes-controller');
const securityPreHandlers = require('../security-pre-handlers');

exports.register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/framework/tubes',
      config: {
        handler: TubesController.getTubes,
        pre: [{ method: securityPreHandlers.checkUserIsMemberOfAnOrganization }],
        tags: ['api', 'framework', 'tubes'],
        notes: [
          "Cette route est restreinte aux utilisateurs authentifiés membre d'une organisation",
          'Elle permet de demander de récupérer tous les sujets du référentiel',
        ],
      },
    },
  ]);
};

exports.name = 'tubes-api';
