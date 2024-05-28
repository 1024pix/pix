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

  server.route([...adminRoutes]);
};

const name = 'oidc-authentication-api';
export { name, register };
