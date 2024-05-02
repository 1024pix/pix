import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { oidcProviderAdminController } from './oidc-provider.admin.controller.js';

export const oidcProviderAdminRoutes = [
  {
    method: 'POST',
    path: '/api/admin/oidc-providers/import',
    config: {
      pre: [{ method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin }],
      payload: { allow: 'application/json' },
      validate: {
        payload: Joi.array().required().items(Joi.object()),
      },
      handler: (request, h) => oidcProviderAdminController.createInBatch(request, h),
      tags: ['authentication', 'api', 'admin', 'oidc', 'import'],
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
          "- Elle permet d'importer une liste de fournisseurs d'identité\n",
      ],
    },
  },
];
