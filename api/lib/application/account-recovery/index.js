const Joi = require('joi');
const identifiersType = require('../../domain/types/identifiers-type');
const featureToggles = require('../preHandlers/feature-toggles');

const accountRecoveryController = require('./account-recovery-controller');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/account-recovery',
      config: {
        pre: [
          {
            method: featureToggles.isScoAccountRecoveryEnabled,
            assign: 'isScoAccountRecoveryEnabled',
          },
        ],
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
          options: {
            allowUnknown: true,
          },
        },
        notes: ['- Permet d\'envoyer un mail de demande d\'ajout de mot de passe pour récupérer son compte Pix.'],
        tags: ['api', 'account-recovery'],
      },
    },

    {
      method: 'GET',
      path: '/api/account-recovery/{temporaryKey}',
      config: {
        auth: false,
        handler: accountRecoveryController.checkAccountRecoveryDemand,
        pre: [
          {
            method: featureToggles.isScoAccountRecoveryEnabled,
            assign: 'isScoAccountRecoveryEnabled',
          },
        ],
        notes: ['- Permet de vérifier la demande de récupération de son compte Pix.\n' +
        '- Renvoie l’utilisateur correspondant à la demande pour une réinitialisation de mot de passe.'],
        tags: ['api', 'account-recovery'],
      },
    },
  ]);
};

exports.name = 'account-recovery-api';
