import Joi from 'joi';

import { oidcController } from './oidc-controller.js';

const register = async function (server) {
  const adminRoutes = [
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
        handler: oidcController.reconcileUserForAdmin,
        notes: [
          "- Cette route permet d'ajouter le fournisseur d'identité d'où provient l'utilisateur comme méthode de connexion à son compte Pix.\n" +
            "- Cette action s'effectue après que l'utilisateur se soit identifié auprès de son fournisseur d'identité",
        ],
        tags: ['api', 'admin', 'oidc'],
      },
    },
  ];

  server.route([
    ...adminRoutes,
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
                redirect_uri: Joi.string().required(),
                state: Joi.string().required(),
                audience: Joi.string().valid('app', 'admin').optional(),
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
        handler: oidcController.findUserForReconciliation,
        notes: [
          "- Cette route permet d'identifier un utilisateur Pix provenant de la double mire OIDC.\n" +
            "- Elle renvoie un objet contenant des informations sur l'utilisateur.",
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
                identity_provider: Joi.string().required(),
                authentication_key: Joi.string().required(),
              }),
              type: Joi.string(),
            }),
          }),
        },
        handler: oidcController.reconcileUser,
        notes: [
          "- Cette route permet d'ajouter le fournisseur d'identité d'où provient l'utilisateur comme méthode de connexion à son compte Pix.\n" +
            "- Cette action se fait suite à la double mire OIDC, quand l'utilisateur s'est identifié auprès de son fournisseur d'identité et a confirmé la réconciliation.\n" +
            '- Elle retourne un access token et une uri de déconnexion',
        ],
        tags: ['api', 'oidc'],
      },
    },
  ]);
};

const name = 'oidc-authentication-api';
export { name, register };
