const certificationCenterController = require('./certification-center-controller');
const securityPreHandlers = require('../security-pre-handlers');

exports.register = async function(server) {
  server.route([

    {
      method: 'POST',
      path: '/api/certification-centers',
      config: {
        handler: certificationCenterController.save,
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        notes: [
          '- **Cette route est restreinte aux utilisateurs Pix Master authentifiés**\n' +
          '- Création d‘un nouveau centre de certification\n' +
          '- L‘utilisateur doit avoir les droits d‘accès en tant que Pix Master',
        ],
        tags: ['api', 'certification-center']
      }
    },
    {
      method: 'GET',
      path: '/api/certification-centers',
      config: {
        handler: certificationCenterController.findPaginatedFilteredCertificationCenters,
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        notes: [
          '- **Cette route est restreinte aux utilisateurs Pix Master authentifiés**\n' +
          '- Liste des centres de certification\n' +
          '- L‘utilisateur doit avoir les droits d‘accès en tant que Pix Master',
        ],
        tags: ['api', 'certification-center']
      }
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{id}',
      config: {
        handler: certificationCenterController.getById,
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        notes: [
          '- **Cette route est restreinte aux utilisateurs Pix Master authentifiés**\n' +
          '- Récupération d\'un centre de certification\n' +
          '- L‘utilisateur doit avoir les droits d‘accès en tant que Pix Master',
        ],
        tags: ['api', 'certification-center']
      }
    },
    {
      method: 'GET',
      path: '/api/certification-centers/{id}/sessions',
      config: {
        handler: certificationCenterController.getSessions,
        tags: ['api', 'certification-center'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n',
          '- Elle retourne les sessions rattachées au centre de certification.',
        ]
      }
    },
  ]);
};

exports.name = 'certification-centers-api';
