import Joi from 'joi';
import * as OidcIdentityProviders from '../../../domain/constants/oidc-identity-providers.js';
import { oidcController } from './oidc-controller.js';

const validOidcProviderCodes = OidcIdentityProviders.getValidOidcProviderCodes();

const register = async function (server) {
  const adminRoutes = [
    {
      method: 'GET',
      path: '/api/admin/oidc/identity-providers',
      config: {
        auth: false,
        handler: oidcController.getAllIdentityProvidersForAdmin,
        notes: [
          "Cette route renvoie un objet contenant tous les fournisseurs d'identité OIDC (même désactivés) pour leur gestion dans Pix Admin",
        ],
        tags: ['api', 'oidc'],
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
                identity_provider: Joi.string()
                  .required()
                  .valid(...validOidcProviderCodes),
                authentication_key: Joi.string().required(),
                source: Joi.string().optional(),
              }),
              type: Joi.string(),
            }),
          }),
        },
        handler: oidcController.reconcileUserForAdmin,
        notes: [
          "- Cette route permet d'ajouter le fournisseur d'identité d'où provient l'utilisateur comme méthode de connexion à son compte Pix.\n" +
            "- Cette action se fait suite à la réconciliation OIDC quand l'utilisateur vient de s'identifier auprès de son fournisseur d'identité",
        ],
        tags: ['api', 'admin', 'oidc'],
      },
    },
  ];

  server.route([
    ...adminRoutes,
    {
      method: 'GET',
      path: '/api/oidc/identity-providers',
      config: {
        auth: false,
        handler: oidcController.getIdentityProviders,
        notes: [
          'Cette route renvoie un objet contenant les informations requises par le front pour les partenaires oidc',
        ],
        tags: ['api', 'oidc'],
      },
    },
    {
      method: 'GET',
      path: '/api/oidc/redirect-logout-url',
      config: {
        validate: {
          query: Joi.object({
            identity_provider: Joi.string()
              .required()
              .valid(
                OidcIdentityProviders.POLE_EMPLOI.code,
                OidcIdentityProviders.FWB.code,
                OidcIdentityProviders.PAYSDELALOIRE.code,
              ),
            logout_url_uuid: Joi.string()
              .regex(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
              .required(),
          }),
        },
        handler: oidcController.getRedirectLogoutUrl,
        notes: [
          "Cette route reçoit un identity provider ainsi qu'une uri de redirection" +
            " et renvoie une uri de déconnexion auprès de l'identity provider renseigné.",
        ],
        tags: ['api', 'oidc', 'authentication'],
      },
    },
    {
      method: 'GET',
      path: '/api/oidc/authentication-url',
      config: {
        auth: false,
        validate: {
          query: Joi.object({
            identity_provider: Joi.string()
              .required()
              .valid(...validOidcProviderCodes),
            redirect_uri: Joi.string().required(),
            source: Joi.string().optional(),
          }),
        },
        handler: oidcController.getAuthenticationUrl,
        notes: [
          "- Cette route permet de récupérer l'url d'authentification du partenaire.\n" +
            '- Elle retournera également les valeurs state et nonce.',
        ],
        tags: ['api', 'oidc', 'authentication'],
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
                identity_provider: Joi.string()
                  .required()
                  .valid(...validOidcProviderCodes),
                code: Joi.string().required(),
                redirect_uri: Joi.string().required(),
                state_sent: Joi.string().required(),
                state_received: Joi.string().required(),
                source: Joi.string().optional(),
              },
            },
          }),
        },
        handler: oidcController.authenticateUser,
        notes: [
          "- Cette route permet de récupérer un token pour un utilisateur provenant d'un partenaire.\n" +
            "- Elle retournera également un access token Pix correspondant à l'utilisateur.",
        ],
        tags: ['api', 'authentication', 'oidc'],
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
                identity_provider: Joi.string()
                  .required()
                  .valid(...validOidcProviderCodes),
                authentication_key: Joi.string().required(),
              },
            },
          }),
        },
        handler: oidcController.createUser,
        notes: [
          "'- Cette route permet de créer un compte Pix pour un utilisateur provenant d'un partenaire.\n'" +
            "- Elle retournera un access token Pix correspondant à l'utilisateur.",
        ],
        tags: ['api', 'oidc', 'authentication'],
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
                'identity-provider': Joi.string()
                  .required()
                  .valid(...validOidcProviderCodes),
                'authentication-key': Joi.string().required(),
              }),
              type: Joi.string(),
            }),
          }),
        },
        handler: oidcController.findUserForReconciliation,
        notes: [
          "- Cette route permet d'identifier un utilisateur Pix provenant de la double mire oidc.\n" +
            '- Elle retournera un access token et une uri de déconnexion',
        ],
        tags: ['api', 'oidc'],
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
                identity_provider: Joi.string()
                  .required()
                  .valid(...validOidcProviderCodes),
                authentication_key: Joi.string().required(),
              }),
              type: Joi.string(),
            }),
          }),
        },
        handler: oidcController.reconcileUser,
        notes: [
          "- Cette route permet d'ajouter le fournisseur d'identité d'où provient l'utilisateur comme méthode de connexion à son compte Pix.\n" +
            "- Cette action se fait suite à la double mire OIDC quand l'utilisateur vient de s'identifier auprès de son fournisseur d'identité",
        ],
        tags: ['api', 'oidc'],
      },
    },
  ]);
};

const name = 'oidc-authentication-api';
export { register, name };
