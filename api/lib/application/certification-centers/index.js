const certificationCenterController = require('./certification-center-controller');
const securityController = require('../../interfaces/controllers/security-controller');

exports.register = async function(server) {
  server.route([

    {
      method: 'POST',
      path: '/api/certification-centers',
      config: {
        handler: certificationCenterController.save,
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
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
        handler: certificationCenterController.find,
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
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
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        notes: [
          '- **Cette route est restreinte aux utilisateurs Pix Master authentifiés**\n' +
          '- Récupération d\'un centre de certification\n' +
          '- L‘utilisateur doit avoir les droits d‘accès en tant que Pix Master',
        ],
        tags: ['api', 'certification-center']
      }
    }
  ]);
};

exports.name = 'certification-centers-api';
