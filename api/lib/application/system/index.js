const systemController = require('./system-controller');
const securityPreHandlers = require('../security-pre-handlers');

exports.register = async function(server) {

  server.route([
    {
      method: 'GET',
      path: '/api/system/heap-dump/{hostname}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: systemController.generateAndDownloadHeapDump,
        notes: [
          '- **Route nécessitant une authentification en tant que Pix Master**\n' +
          '- Génère et retourne un fichier heap dump'
        ],
        tags: ['api', 'system']
      }
    },
    {
      method: 'GET',
      path: '/api/system/heap-profile/{hostname}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: systemController.generateAndDownloadHeapProfile,
        notes: [
          '- **Route nécessitant une authentification en tant que Pix Master**\n' +
          '- Génère et retourne un fichier heap profile'
        ],
        tags: ['api', 'system']
      }
    },
  ]);
};

exports.name = 'system-api';
