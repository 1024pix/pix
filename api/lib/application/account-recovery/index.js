import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);
const inePattern = new RegExp('^[0-9]{9}[a-zA-Z]{2}$');
const inaPattern = new RegExp('^[0-9]{10}[a-zA-Z]{1}$');

import { accountRecoveryController } from './account-recovery-controller.js';

const register = async function (server) {
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
        notes: ["- Permet d'envoyer un mail de demande d'ajout de mot de passe pour récupérer son compte Pix."],
        tags: ['api', 'account-recovery'],
      },
    },
  ]);
};

const name = 'account-recovery-api';
export { name, register };
