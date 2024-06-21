import Joi from 'joi';
import XRegExp from 'xregexp';

import { config } from '../../../shared/config.js';
import { accountRecoveryController } from './account-recovery.controller.js';

const { passwordValidationPattern } = config.account;

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
];
