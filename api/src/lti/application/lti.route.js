import Joi from 'joi';

import { featureToggles } from '../../shared/infrastructure/feature-toggles/index.js';
import { ltiDeepLinkingStrategyName } from '../infrastructure/lti-authentication.js';
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
        handler: (request, h) => ltiController.deepLink(request, h),
        notes: [
          'Cette route reçoit une deep-linking request, positionne un Cookie et redirige l’utilisateur vers un formulaire de sélection de campagne sur PixOrga.',
        ],
        tags: ['api', 'lti'],
      },
    },
    {
      method: 'GET',
      path: '/api/lti/campaigns',
      options: {
        auth: { strategy: ltiDeepLinkingStrategyName },
        handler: (request, h) => ltiController.findAvailableCampaigns(request, h),
        notes: [
          'Cette route permet de récupérer la liste des campagnes disponibles pour les organisations correspondantes.',
        ],
        tags: ['api', 'lti'],
      },
    },
    {
      method: 'POST',
      path: '/api/lti/select-campaign',
      options: {
        auth: { strategy: ltiDeepLinkingStrategyName },
        handler: (request, h) => ltiController.selectCampaign(request, h),
        notes: ['Cette route renvoie une deep-linking response prêt pour être renvoyée à Moodle.'],
        tags: ['api', 'lti'],
      },
    },
    {
      method: 'POST',
      path: '/api/lti/resource-link',
      options: {
        auth: false,
        handler: (request, h) => ltiController.resourceLink(request, h),
        notes: [`Cette route reçoit une resource link request et redirige l'utilisateur vers la ressource demandée`],
        tags: ['api', 'lti'],
      },
    },
  ]);
}

const name = 'lti/lti-api';

export const ltiRoutes = [{ register, name }];
