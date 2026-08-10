import { JoiDate } from '@joi/date';
import BaseJoi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import * as organizationMemberIdentitiesController from './organization-member-identities.controller.js';
const Joi = BaseJoi.extend(JoiDate);

export const organizationMemberIdentitiesRoute = [
  {
    method: 'GET',
    path: '/api/organizations/{id}/member-identities',
    config: {
      pre: [
        {
          method: securityPreHandlers.checkUserBelongsToOrganization,
          assign: 'belongsToOrganization',
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.organizationId,
        }),
      },
      handler: (request, h) => organizationMemberIdentitiesController.getOrganizationMemberIdentities(request, h),
      tags: ['api', 'organizations'],
      notes: [
        'Cette route est restreinte aux utilisateurs authentifiés',
        "Elle retourne l'identité des membres rattachés à l’organisation.",
      ],
    },
  },
];
