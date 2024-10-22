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
          email: Joi.when('data.attributes.email', {
            then: Joi.string().email().default(Joi.ref('data.attributes.email')),
            otherwise: Joi.string().email().required(),
          }),
          data: {
            attributes: {
              email: Joi.string().email().required(),
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
      notes: [
        'Route publique',
        'Cette route permet la redirection vers le formulaire de reset de mot de passe si la demande est bien dans la liste',
      ],
      tags: ['api', 'passwords'],
    },
  },
];
