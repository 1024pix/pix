const Joi = require('joi');
const identifiersType = require('../../domain/types/identifiers-type');
const accountRecoveryController = require('./account-recovery-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/account-recovery',
      config: {
        auth: false,
        handler: accountRecoveryController.sendEmailForAccountRecovery,
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                'user-id': identifiersType.userId,
                email: Joi.string().email().required(),
              },
            },
          }),
        },
        notes: ['- Permet de faire une demande de réinitialisation ou d\'ajout de mot de passe pour récupérer son compte Pix.'],
        tags: ['api', 'account-recovery'],
      },
    },
  ]);
};

exports.name = 'account-recovery-api';
