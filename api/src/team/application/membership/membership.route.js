import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { membershipController } from './membership.controller.js';

export const membershipRoutes = [
  {
    method: 'PATCH',
    path: '/api/memberships/{id}',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkUserIsAdminInOrganization(request, h),
          assign: 'isAdminInOrganization',
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.membershipId,
        }),
      },
      handler: (request, h) => membershipController.update(request, h),
      description: 'Update organization role by admin for a organization members',
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés en tant qu'administrateur de l'organisation**\n" +
          "- Elle permet de modifier le rôle d'un membre de l'organisation",
      ],
      plugins: {
        'hapi-swagger': {
          payloadType: 'form',
          order: 2,
        },
      },
      tags: ['api', 'memberships'],
    },
  },
];
