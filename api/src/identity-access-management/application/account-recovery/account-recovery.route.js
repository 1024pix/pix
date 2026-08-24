import JoiDate from '@joi/date';
import BaseJoi from 'joi';

import { PasswordSchema } from '../../../shared/domain/validators/password-validator.js';
import { accountRecoveryController } from './account-recovery.controller.js';

const Joi = BaseJoi.extend(JoiDate);

export const accountRecoveryRoutes = [
  {
    method: 'GET',
    path: '/api/account-recovery/{temporaryKey}',
    config: {
      auth: false,
      handler: (request, h) => accountRecoveryController.checkAccountRecoveryDemand(request, h),
      validate: {
        params: Joi.object({ temporaryKey: Joi.string().min(32) }),
      },
      notes: ['Permet de vérifier une demande de récupération de compte.'],
      tags: ['identity-access-management', 'api', 'account-recovery'],
    },
  },
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
              password: PasswordSchema.required(),
            },
          },
        }),
        options: { allowUnknown: true },
      },
      notes: ['Permet de déclencher la récupération de compte via une demande de récupération de compte.'],
      tags: ['identity-access-management', 'api', 'account-recovery'],
    },
  },
];
