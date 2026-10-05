import Joi from 'joi';

import { healthcheckController } from './healthcheck-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api',
      config: {
        auth: false,
        handler: healthcheckController.get,
        notes: ['- **Cette route est publique**\n' + "- Permet de vérifier que l'API est démarrée\n"],
        response: {
          failAction: 'log',
          status: {
            200: Joi.object({
              name: Joi.string(),
              version: Joi.string(),
              description: Joi.string(),
              environment: Joi.string(),
              'container-version': Joi.string(),
              'container-app-name': Joi.string(),
              'current-lang': Joi.string(),
            }).label('Healthcheck-Object'),
          },
        },
        tags: ['api', 'healthcheck', 'parcoursup'],
      },
    },
    {
      method: 'GET',
      path: '/api/healthcheck/db',
      config: {
        auth: false,
        handler: healthcheckController.checkDbStatus,
        tags: ['api', 'healthcheck'],
      },
    },
    {
      method: 'GET',
      path: '/api/healthcheck/redis',
      config: {
        auth: false,
        handler: healthcheckController.checkRedisStatus,
        tags: ['api', 'healthcheck'],
      },
    },
    {
      method: 'GET',
      path: '/api/healthcheck/forwarded-origin',
      config: {
        auth: false,
        handler: healthcheckController.checkForwardedOriginStatus,
        notes: ['- **Cette route est publique**\n' + "- Récupération de l'origine HTTP de l'application appelante\n"],
        tags: ['api', 'healthcheck'],
      },
    },
    {
      method: 'GET',
      path: '/api/healthcheck/os',
      config: {
        auth: false,
        handler: healthcheckController.checkOsStatus,
        tags: ['api', 'healthcheck'],
      },
    },
  ]);
};

export const healthcheckRoute = { name: 'shared/healthcheck-api', register };
