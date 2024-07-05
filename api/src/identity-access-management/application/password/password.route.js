import Joi from 'joi';

import { passwordController } from './password.controller.js';

export const passwordRoutes = [
  {
    method: 'POST',
    path: '/api/password-reset-demands',
    config: {
      auth: false,
      handler: (request, h) => passwordController.createResetPasswordDemand(request, h),
      validate: {
        payload: Joi.object({
          data: {
            attributes: {
              email: Joi.string().email().required(),
              // TODO supprimer "temporary-key" car il est généré dans le usecase associé à cette route
              'temporary-key': [Joi.string(), null],
            },
            type: Joi.string(),
          },
        }),
      },
      notes: ['Route publique', 'Faire une demande de réinitialisation de mot de passe'],
      tags: ['identity-access-management', 'api', 'password'],
    },
  },
  {
    method: 'GET',
    path: '/api/password-reset-demands/{temporaryKey}',
    config: {
      auth: false,
      handler: (request, h) => passwordController.checkResetDemand(request, h),
      tags: ['api', 'passwords'],
    },
  },
];
