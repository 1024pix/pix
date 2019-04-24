const gcController = require('./gc-controller');
const securityController = require('../../interfaces/controllers/security-controller');

exports.register = async function(server) {

  server.route([
    {
      method: 'GET',
      path: '/api/gc/heap-dump',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: gcController.generateAndDownloadHeapDump,
        notes: [
          '- **Route nécessitant une authentification en tant que Pix Master**\n' +
          '- Génère et retourne un fichier heap dump'
        ],
        tags: ['api', 'gc']
      }
    },
    {
      method: 'GET',
      path: '/api/gc/heap-profile',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: gcController.generateAndDownloadHeapProfile,
        notes: [
          '- **Route nécessitant une authentification en tant que Pix Master**\n' +
          '- Génère et retourne un fichier heap profile'
        ],
        tags: ['api', 'gc']
      }
    },
  ]);
};

exports.name = 'gc-api';
