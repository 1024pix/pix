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
  {
    method: 'GET',
    path: '/api/oidc/redirect-logout-url',
    config: {
      validate: {
        query: Joi.object({
          identity_provider: Joi.string().required(),
          logout_url_uuid: Joi.string()
            .regex(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
            .required(),
        }),
      },
      handler: (request, h) => oidcProviderController.getRedirectLogoutUrl(request, h),
      notes: [
        "Cette route reçoit le code d'un fournisseur d'identité et renvoie une uri de déconnexion auprès du fournisseur d'identité renseigné.",
      ],
      tags: ['identity-access-management', 'api', 'oidc'],
    },
  },
];
