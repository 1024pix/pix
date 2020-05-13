const Joi = require('@hapi/joi');

const securityPreHandlers = require('../security-pre-handlers');
const prescriberController = require('./prescriber-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/prescription/prescribers/{userId}',
      config: {
        validate: {
          params: Joi.object({
            userId: Joi.number().required(),
          }),
        },
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser'
        }],
        handler: prescriberController.get,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération d’un prescripteur.\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'prescription'],
      }
    },

  ]);
};

exports.name = 'prescribers-api';
