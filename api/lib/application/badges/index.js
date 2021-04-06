const securityPreHandlers = require('../security-pre-handlers');
const badgesController = require('./badges-controller');
const Joi = require('joi');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/badges/{id}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.badgeId,
          }),
        },
        handler: badgesController.getBadge,
        tags: ['api', 'badges'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de récupérer un résultat thématique.',
        ],
      },
    },
  ]);
};

exports.name = 'badges-api';
