import JoiDate from '@joi/date';
import BaseJoi from 'joi';
import XRegExp from 'xregexp';

import { config } from '../../../shared/config.js';
import { accountRecoveryController } from './account-recovery.controller.js';

const Joi = BaseJoi.extend(JoiDate);
const { passwordValidationPattern } = config.account;
const inePattern = new RegExp('^[0-9]{9}[a-zA-Z]{2}$');
const inaPattern = new RegExp('^[0-9]{10}[a-zA-Z]{1}$');

export const accountRecoveryRoutes = [
  {
    method: 'PATCH',
    path: '/api/account-recovery',
    config: {
      auth: false,
      handler: (request, h) => accountRecoveryController.updateUserAccountFromRecoveryDemand(request, h),
      validate: {
        payload: Joi.object({
          data: {
            attributes: {
              'temporary-key': Joi.string().min(32).required(),
              password: Joi.string().pattern(XRegExp(passwordValidationPattern)).required(),
            },
          },
        }),
        options: {
          allowUnknown: true,
        },
      },
      notes: [
        '- Permet de mettre à jour les informations d’un utilisateur via à une demande de récupération de compte.',
      ],
      tags: ['identity-access-management', 'api', 'account-recovery'],
    },
  },
  {
    method: 'GET',
    path: '/api/account-recovery/{temporaryKey}',
    config: {
      auth: false,
      handler: (request, h) => accountRecoveryController.checkAccountRecoveryDemand(request, h),
      validate: {
        params: Joi.object({ temporaryKey: Joi.string().min(32) }),
      },
      notes: [
        '- Permet de vérifier la demande de récupération de son compte Pix.\n' +
          '- Renvoie l’utilisateur correspondant à la demande pour une réinitialisation de mot de passe.',
      ],
      tags: ['identity-access-management', 'api', 'account-recovery'],
    },
  },
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
];
