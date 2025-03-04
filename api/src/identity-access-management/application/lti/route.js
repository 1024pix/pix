import Joi from 'joi';

import { ltiController } from './controller.js';

export const ltiRoutes = [
  {
    method: 'GET',
    path: '/api/lti/keys',
    options: {
      auth: false,
      cache: false,
      handler: (request, h) => ltiController.getKeys(request, h),
      notes: ['pouet'],
      tags: ['lti'],
    },
  },
  {
    method: 'POST',
    path: '/api/lti/init',
    options: {
      auth: false,
      cache: false,
      handler: (request, h) => ltiController.init(request, h),
      notes: ['pouet'],
      tags: ['lti'],
    },
  },
  {
    method: 'POST',
    path: '/api/lti/launch',
    options: {
      auth: false,
      cache: false,
      handler: (request, h) => ltiController.launch(request, h),
      notes: ['pouet'],
      tags: ['lti'],
    },
  },
  {
    method: 'GET',
    path: '/api/lti/content-selection',
    options: {
      auth: false,
      cache: false,
      handler: (request, h) => ltiController.contentSelection(request, h),
      notes: ['pouet'],
      tags: ['lti'],
    },
  },
  {
    method: 'GET',
    path: '/api/lti/config',
    options: {
      auth: false,
      cache: false,
      validate: {
        query: Joi.object({
          openid_configuration: Joi.string().uri().required(),
          registration_token: Joi.string().required(),
        }),
      },
      handler: ltiController.config,
      notes: ['pouet'],
      tags: ['lti'],
    },
  },
  {
    method: 'GET',
    path: '/api/lti/score',
    options: {
      auth: false,
      cache: false,
      handler: ltiController.score,
      notes: ['pouet'],
      tags: ['lti'],
    },
  },
];
