import Joi from 'joi';

import { checkIfUserIsBlocked } from '../security-pre-handlers.js';
import { samlController } from './saml.controller.js';

export const samlRoutes = [
  {
    method: 'GET',
    path: '/api/saml/metadata.xml',
    config: {
      auth: false,
      handler: samlController.metadata,
      tags: ['api', 'authentication', 'saml'],
    },
  },
  {
    method: 'GET',
    path: '/api/saml/login',
    config: {
      auth: false,
      handler: samlController.login,
      tags: ['api', 'authentication', 'saml'],
    },
  },
  {
    method: 'POST',
    path: '/api/saml/assert',
    config: {
      auth: false,
      handler: samlController.assert,
      tags: ['api', 'authentication', 'saml'],
    },
  },
  {
    method: 'POST',
    path: '/api/token-from-external-user',
    config: {
      auth: false,
      validate: {
        payload: Joi.object({
          data: {
            type: Joi.string().valid('external-user-authentication-requests').required(),
            attributes: {
              username: Joi.string().required(),
              password: Joi.string().required(),
              'external-user-token': Joi.string().required(),
              'expected-user-id': Joi.number().positive().required(),
            },
          },
        }),
      },
      pre: [{ method: checkIfUserIsBlocked }],
      handler: samlController.authenticateForSaml,
      notes: [
        '- Cette route permet d’authentifier un utilisateur Pix provenant de la double mire GAR.\n' +
          '- Elle renvoie un objet contenant un access token.',
      ],
      tags: ['api', 'authentication', 'saml'],
    },
  },
];
