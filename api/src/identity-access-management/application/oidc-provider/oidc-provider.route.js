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
  {
    method: 'GET',
    path: '/api/oidc/authorization-url',
    config: {
      auth: false,
      validate: {
        query: Joi.object({
          identity_provider: Joi.string().required(),
          audience: Joi.string().valid('app', 'admin').optional(),
        }),
      },
      handler: (request, h) => oidcProviderController.getAuthorizationUrl(request, h),
      notes: [
        "- Cette route permet de récupérer l'url d'autorisation du partenaire.\n" +
          '- Elle retournera également les valeurs state et nonce.',
      ],
      tags: ['identity-access-management', 'api', 'oidc'],
    },
  },
  {
    method: 'POST',
    path: '/api/oidc/token',
    config: {
      auth: false,
      validate: {
        payload: Joi.object({
          data: {
            attributes: {
              identity_provider: Joi.string().required(),
              code: Joi.string().required(),
              state: Joi.string().required(),
              iss: Joi.string().optional(),
              audience: Joi.string().valid('app', 'admin').optional(),
            },
          },
        }),
      },
      handler: (request, h) => oidcProviderController.authenticateOidcUser(request, h),
      notes: [
        "- Cette route permet de récupérer un token pour un utilisateur provenant d'un partenaire.\n" +
          "- Elle retournera également un access token Pix correspondant à l'utilisateur.",
      ],
      tags: ['identity-access-management', 'api', 'oidc'],
    },
  },
  {
    method: 'POST',
    path: '/api/oidc/users',
    config: {
      auth: false,
      validate: {
        payload: Joi.object({
          data: {
            attributes: {
              identity_provider: Joi.string().required(),
              authentication_key: Joi.string().required(),
            },
          },
        }),
      },
      handler: (request, h) => oidcProviderController.createUser(request, h),
      notes: [
        "'- Cette route permet de créer un compte Pix pour un utilisateur provenant d'un partenaire.\n'" +
          "- Elle retournera un access token Pix correspondant à l'utilisateur ainsi qu'un identifiant de session pour la déconnexion.",
      ],
      tags: ['identity-access-management', 'api', 'oidc'],
    },
  },
  {
    method: 'POST',
    path: '/api/oidc/user/check-reconciliation',
    config: {
      auth: false,
      validate: {
        payload: Joi.object({
          data: Joi.object({
            attributes: Joi.object({
              email: Joi.string().email().required(),
              password: Joi.string().required(),
              'identity-provider': Joi.string().required(),
              'authentication-key': Joi.string().required(),
            }),
            type: Joi.string(),
          }),
        }),
      },
      handler: (request, h) => oidcProviderController.findUserForReconciliation(request, h),
      notes: [
        "- Cette route permet d'identifier un utilisateur Pix provenant de la double mire OIDC.\n" +
          "- Elle renvoie un objet contenant des informations sur l'utilisateur.",
      ],
      tags: ['identity-access-management', 'api', 'oidc'],
    },
  },
  {
    method: 'POST',
    path: '/api/oidc/user/reconcile',
    config: {
      auth: false,
      validate: {
        payload: Joi.object({
          data: Joi.object({
            attributes: Joi.object({
              identity_provider: Joi.string().required(),
              authentication_key: Joi.string().required(),
            }),
            type: Joi.string(),
          }),
        }),
      },
      handler: (request, h) => oidcProviderController.reconcileUser(request, h),
      notes: [
        "- Cette route permet d'ajouter le fournisseur d'identité d'où provient l'utilisateur comme méthode de connexion à son compte Pix.\n" +
          "- Cette action se fait suite à la double mire OIDC, quand l'utilisateur s'est identifié auprès de son fournisseur d'identité et a confirmé la réconciliation.\n" +
          '- Elle retourne un access token et une uri de déconnexion',
      ],
      tags: ['identity-access-management', 'api', 'oidc'],
    },
  },
];
