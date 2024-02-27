import BaseJoi from 'joi';
import JoiDate from '@joi/date';
const Joi = BaseJoi.extend(JoiDate);

import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { organizationLearnerController } from './organization-learner-controller.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';

const register = async function (server) {
  const adminRoutes = [
    {
      method: 'DELETE',
      path: '/api/admin/organization-learners/{id}/association',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        handler: organizationLearnerController.dissociate,
        validate: {
          params: Joi.object({
            id: identifiersType.organizationLearnerId,
          }),
        },
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle dissocie un utilisateur d’un prescrit',
        ],
        tags: ['api', 'admin', 'organization-learners'],
      },
    },
  ];

  server.route([
    ...adminRoutes,
    {
      method: 'GET',
      path: '/api/organization-learners',
      config: {
        handler: organizationLearnerController.findAssociation,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération du prescrit\n' +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'organization-learners'],
      },
    },
  ]);
};

const name = 'organization-learners-api';
export { register, name };
