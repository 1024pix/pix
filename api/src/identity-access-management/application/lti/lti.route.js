import Joi from 'joi';

import { ltiController } from './lti.controller.js';

export const ltiRoutes = [
  {
    method: 'GET',
    path: '/api/lti/keys',
    options: {
      auth: false,
      cache: false,
      handler: (request, h) => ltiController.listPublicKeys(request, h),
      notes: ['Cette route renvoie une liste contenant les public keys des plateformes actives'],
      tags: ['identity-access-management', 'api', 'lti'],
    },
  },
  {
    method: 'GET',
    path: '/api/lti/registration',
    options: {
      auth: false,
      cache: false,
      validate: {
        query: Joi.object({
          openid_configuration: Joi.string().uri().required(),
          registration_token: Joi.string().required(),
        }).required(),
      },
      handler: (request, h) => ltiController.register(request, h),
      notes: ["Cette route réalise une demande d'enregistrement d'une plateforme."],
      tags: ['identity-access-management', 'api', 'lti'],
    },
  },
  {
    method: 'POST',
    path: '/api/lti/init',
    options: {
      auth: false,
      cache: false,
      handler: (request, h) => ltiController.init(request, h),
      notes: ['Cette route initialise un workflow LTI'],
      tags: ['identity-access-management', 'api', 'lti'],
    },
  },
];
