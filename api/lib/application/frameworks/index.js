const frameworkController = require('./frameworks-controller');
const securityPreHandlers = require('../security-pre-handlers');

exports.register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/frameworks/pix/areas',
      config: {
        handler: frameworkController.getPixFramework,
        pre: [{ method: securityPreHandlers.checkUserIsMemberOfAnOrganization }],
        tags: ['api', 'framework', 'pix'],
        notes: [
          "Cette route est restreinte aux utilisateurs authentifiés membre d'une organisation",
          "Elle permet de récupérer toutes les données du référentiel Pix jusqu'aux sujets",
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/frameworks',
      config: {
        handler: frameworkController.getFrameworks,
        pre: [{ method: securityPreHandlers.checkUserHasRoleSuperAdmin }],
        tags: ['api', 'framework'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master',
          'Elle permet de récupérer la liste des référentiels disponibles',
        ],
      },
    },
  ]);
};

exports.name = 'tubes-api';
