import Joi from 'joi';

import { tagController } from '../../../../lib/application/tags/tag-controller.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/tags',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        validate: {
          payload: Joi.object({
            data: {
              type: 'tags',
              attributes: {
                name: Joi.string().required(),
              },
            },
          }),
          options: {
            allowUnknown: true,
          },
        },
        handler: (request, h) => tagController.create(request, h),
        tags: ['api', 'admin', 'tags'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés ayant le role Super Admin**\n' +
            '- Elle permet de créer un tag',
        ],
      },
    },
  ]);
};

const name = 'tags-admin-api';

export { name, register };
