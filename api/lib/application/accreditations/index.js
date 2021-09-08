const accreditationController = require('./accreditation-controller');
const securityPreHandlers = require('../security-pre-handlers');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/accreditations',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: accreditationController.findAccreditations,
        tags: ['api'],
        notes: [
          'Cette route est utilisée par Pix Admin',
          'Elle renvoie la liste des accreditations à des certifications complémentaires existantes.',
        ],
      },
    },

  ]);
};

exports.name = 'accreditations';
