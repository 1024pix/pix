const Joi = require('@hapi/joi');

const securityPreHandlers = require('../security-pre-handlers');
const certificationPointOfContactController = require('./certification-point-of-contact-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/certification-point-of-contacts/{userId}',
      config: {
        validate: {
          params: Joi.object({
            userId: Joi.number().required(),
          }),
        },
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        handler: certificationPointOfContactController.get,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération d’un référent de certification.\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'certification', 'certification-point-of-contact'],
      },
    },

  ]);
};

exports.name = 'certification-point-of-contacts-api';
