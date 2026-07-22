import Joi from 'joi';

import { PasswordSchema } from '../../../shared/domain/validators/password-validator.js';
import { passwordController } from './password.controller.js';

export const passwordRoutes = [
  {
    method: 'POST',
    path: '/api/password-reset-demands',
    config: {
      auth: false,
      handler: (request, h) => passwordController.createResetPasswordDemand(request, h),
      validate: {
        payload: Joi.object().required().keys({
          email: Joi.string().email().required(),
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
      notes: [
        'Route publique',
        'Cette route permet la redirection vers le formulaire de reset de mot de passe si la demande est bien dans la liste',
      ],
      tags: ['api', 'passwords'],
    },
  },
  {
    method: 'POST',
    path: '/api/expired-password-updates',
    config: {
      auth: false,
      handler: (request, h) => passwordController.updateExpiredPassword(request, h),
      validate: {
        payload: Joi.object({
          data: {
            attributes: {
              'password-reset-token': Joi.string().required(),
              'new-password': PasswordSchema.required(),
            },
            type: Joi.string(),
          },
        }),
      },
      notes: ['Route publique', 'Cette route permet de mettre à jour un mot de passe expiré'],
      tags: ['api', 'passwords'],
    },
  },
];
