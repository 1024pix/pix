const securityController = require('../../interfaces/controllers/security-controller');
const sessionController = require('./session-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/sessions',
      config: {
        handler: sessionController.find,
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        tags: ['api', 'sessions'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de consulter la liste de toutes les sessions (retourne un tableau avec n éléments)',
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/sessions/{id}',
      config: {
        auth: false,
        handler: sessionController.get,
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/api/sessions',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: sessionController.save,
        tags: ['api']
      }
    }
  ]);
};

exports.name = 'sessions-api';
