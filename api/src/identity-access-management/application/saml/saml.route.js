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
];
