import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { getSupportedLocales } from '../../shared/domain/services/locale-service.js';
import { announcementController } from './announcement-controller.js';

const ANNOUNCEMENT_NAME_SCHEMA = Joi.string().valid('SCO').required();

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/announcements/{name}',
      options: {
        auth: false,
        validate: {
          params: Joi.object({
            name: ANNOUNCEMENT_NAME_SCHEMA,
          }),
        },
        handler: announcementController.get,
        tags: ['api', 'announcement'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/announcements/{name}',
      options: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        validate: {
          params: Joi.object({
            name: ANNOUNCEMENT_NAME_SCHEMA,
          }),
          payload: Joi.object({
            data: Joi.object({
              id: Joi.string(),
              type: Joi.string().required(),
              attributes: Joi.object({
                content: Joi.object({})
                  .pattern(Joi.string().equal(...getSupportedLocales()), Joi.string().allow(''))
                  .required(),
              }).required(),
            }).required(),
          }),
        },
        handler: announcementController.update,
        tags: ['api', 'admin', 'announcement'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          "Elle permet de mettre à jour le contenu d'une annonce.",
        ],
      },
    },
  ]);
};

export const announcementRoute = { name: 'announcements-api', register };
