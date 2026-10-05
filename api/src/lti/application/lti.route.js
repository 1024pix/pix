import Joi from 'joi';

import { featureToggles } from '../../shared/infrastructure/feature-toggles/index.js';
import { ltiController } from './lti.controller.js';

async function register(server, options, dependencies = { featureToggles }) {
  const isLtiEnabled = await dependencies.featureToggles.get('isLtiEnabled');

  if (!isLtiEnabled) {
    return;
  }

  server.route([
    {
      method: 'GET',
      path: '/api/lti/keys',
      options: {
        auth: false,
        cache: false,
        handler: (request, h) => ltiController.listPublicKeys(request, h),
        notes: ['Cette route renvoie une liste contenant les public keys des plateformes actives'],
        tags: ['api', 'lti'],
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
        tags: ['api', 'lti'],
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
        tags: ['api', 'lti'],
      },
    },
    {
      method: 'POST',
      path: '/api/lti/deep-linking',
      options: {
        auth: false,
        cache: false,
        handler: (request, h) => ltiController.deepLink(request, h),
        notes: [
          "Cette route reçoit une deep-linking request et renvoie une deep-linking response. On renvoie l'utilisateur vers moodle avec la deep-linking response" +
            'via un formulaire auto-submit',
        ],
        tags: ['api', 'lti'],
      },
    },
    {
      method: 'POST',
      path: '/api/lti/resource-link',
      options: {
        auth: false,
        cache: false,
        handler: (request, h) => ltiController.resourceLink(request, h),
        notes: [`Cette route reçoit une resource link request et redirige l'utilisateur vers la ressource demandée`],
        tags: ['api', 'lti'],
      },
    },
  ]);
}

const name = 'lti/lti-api';

export const ltiRoutes = [{ register, name }];
