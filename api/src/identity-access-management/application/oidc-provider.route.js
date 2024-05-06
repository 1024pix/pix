import Joi from 'joi';

import { oidcProviderController } from './oidc-provider.controller.js';

export const oidcProviderRoutes = [
  {
    method: 'GET',
    path: '/api/oidc/identity-providers',
    config: {
      validate: {
        query: Joi.object({
          audience: Joi.string().optional().default('app'),
        }),
      },
      auth: false,
      handler: (request, h) => oidcProviderController.getIdentityProviders(request, h),
      notes: [
        'Cette route renvoie une liste contenant les informations requises par le front pour les partenaires OIDC',
      ],
      tags: ['identity-access-management', 'api', 'oidc'],
    },
  },
];
