import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
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
      tags: ['identity-access-management', 'api', 'admin', 'oidc', 'import'],
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
          "- Elle permet d'importer une liste de fournisseurs d'identité\n",
      ],
    },
  },
  {
    method: 'GET',
    path: '/api/admin/oidc/identity-providers',
    config: {
      handler: (request, h) => oidcProviderAdminController.getAllIdentityProvidersForAdmin(request, h),
      notes: [
        "Cette route renvoie une liste contenant tous les fournisseurs d'identité OIDC (même désactivés) pour leur gestion dans Pix Admin",
      ],
      tags: ['identity-access-management', 'api', 'admin', 'oidc'],
    },
  },
  {
    method: 'POST',
    path: '/api/admin/oidc/user/reconcile',
    config: {
      auth: false,
      validate: {
        payload: Joi.object({
          data: Joi.object({
            attributes: Joi.object({
              email: Joi.string().email().required(),
              identity_provider: Joi.string().required(),
              authentication_key: Joi.string().required(),
            }),
            type: Joi.string(),
          }),
        }),
      },
      handler: (request, h) => oidcProviderAdminController.reconcileUserForAdmin(request, h),
      notes: [
        "- Cette route permet d'ajouter le fournisseur d'identité d'où provient l'utilisateur comme méthode de connexion à son compte Pix.\n" +
          "- Cette action s'effectue après que l'utilisateur se soit identifié auprès de son fournisseur d'identité",
      ],
      tags: ['identity-access-management', 'api', 'admin', 'oidc'],
    },
  },
];
