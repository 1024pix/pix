const securityPreHandlers = require('../security-pre-handlers');
const scoringSimulatorController = require('./scoring-simulator-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'POST',
      path: '/api/scoring-simulator/old',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: scoringSimulatorController.calculateOldScores,
        tags: ['api'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés',
          "Elle renvoie le score Pix calculé avec l'ancien algorithme pour une liste de questions et réponses données",
        ],
      },
    },
  ]);
};

exports.name = 'scoring-simulator-api';
