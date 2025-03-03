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
];
