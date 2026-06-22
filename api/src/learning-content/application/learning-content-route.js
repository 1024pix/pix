import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { learningContentController } from './learning-content-controller.js';

async function register(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/lcms/releases',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        handler: learningContentController.createRelease,
        tags: ['api', 'lcms'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de lancer un job pour demander la création d’une nouvelle version au référentiel\n' +
            ' et de recharger le cache',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/cache/{model}/{id}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        validate: {
          params: Joi.object({
            id: Joi.string().required(),
            model: Joi.string()
              .valid(
                'frameworks',
                'areas',
                'competences',
                'thematics',
                'tubes',
                'skills',
                'challenges',
                'tutorials',
                'courses',
                'modules',
              )
              .required(),
          }),
        },
        handler: learningContentController.patchCacheEntry,
        tags: ['api', 'cache'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de mettre à jour une entrée du cache de l’application\n' +
            'Attention : pour un état cohérent des objets stockés en cache, utiliser PATCH /api/cache',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/cache',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        handler: learningContentController.refreshCache,
        tags: ['api', 'cache'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de lancer un job pour précharger les entrées du cache de l’application \n' +
            '(les requêtes les plus longues)',
        ],
      },
    },
  ]);
}

const name = 'learning-content/lcms-api';
export const learningContentRoute = { name, register };
