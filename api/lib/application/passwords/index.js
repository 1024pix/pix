const Joi = require('joi');
const XRegExp = require('xregexp');

const { passwordValidationPattern } = require('../../config.js').account;
const passwordController = require('./password-controller.js');

exports.register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/password-reset-demands',
      config: {
        auth: false,
        handler: passwordController.createResetDemand,
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                email: Joi.string().email().required(),
                'temporary-key': [Joi.string(), null],
              },
              type: Joi.string(),
            },
          }),
        },
        notes: ['Route publique', 'Faire une demande de réinitialisation de mot de passe'],
        tags: ['api', 'passwords'],
      },
    },

    {
      method: 'GET',
      path: '/api/password-reset-demands/{temporaryKey}',
      config: {
        auth: false,
        handler: passwordController.checkResetDemand,
        tags: ['api', 'passwords'],
      },
    },
    {
      method: 'POST',
      path: '/api/expired-password-updates',
      config: {
        auth: false,
        handler: passwordController.updateExpiredPassword,
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                'password-reset-token': Joi.string().required(),
                'new-password': Joi.string().pattern(XRegExp(passwordValidationPattern)).required(),
              },
              type: Joi.string(),
            },
          }),
        },
        notes: ['Route publique', 'Cette route permet de mettre à jour un mot de passe expiré'],
        tags: ['api', 'passwords'],
      },
    },
  ]);
};

exports.name = 'passwords-api';
