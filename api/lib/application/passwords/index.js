import Joi from 'joi';
import XRegExp from 'xregexp';

import { config } from '../../../src/shared/config.js';
import { passwordController } from './password-controller.js';

const { passwordValidationPattern } = config.account;

const register = async function (server) {
  server.route([
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

const name = 'passwords-api';
export { name, register };
