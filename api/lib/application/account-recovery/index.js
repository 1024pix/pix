const Joi = require('joi').extend(require('@joi/date'));
const featureToggles = require('../preHandlers/feature-toggles');

const inePattern = new RegExp('^[0-9]{9}[a-zA-Z]{2}$');
const inaPattern = new RegExp('^[0-9]{10}[a-zA-Z]{1}$');

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
                'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
                'ine-ina': Joi.alternatives().try(
                  Joi.string().regex(inePattern).required(),
                  Joi.string().regex(inaPattern).required(),
                ),
                birthdate: Joi.date().format('YYYY-MM-DD').required(),
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
