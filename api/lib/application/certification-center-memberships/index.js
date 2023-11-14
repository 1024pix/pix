import Joi from 'joi';

import { certificationCenterMembershipController } from './certification-center-membership-controller.js';
import { securityPreHandlers } from '../security-pre-handlers.js';
import { identifiersType } from '../../domain/types/identifiers-type.js';

const register = async function (server) {
  const globalRoutes = [
    {
      method: 'PATCH',
      path: '/api/certification-centers/{certificationCenterId}/certification-center-memberships/{id}',
      config: {
        validate: {
          params: Joi.object({
            certificationCenterId: identifiersType.certificationCenterId,
            id: identifiersType.certificationCenterMembershipId,
          }),
        },
        handler: certificationCenterMembershipController.updateFromPixCertif,
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminOfCertificationCenter,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
            "- Modification du rôle d'un membre d'un centre de certification\n",
        ],
        tags: ['api', 'certification-center-membership'],
      },
    },
  ];
  const adminRoutes = [
    {
      method: 'DELETE',
      path: '/api/admin/certification-center-memberships/{id}',
      config: {
        handler: certificationCenterMembershipController.disable,
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
            '- Désactivation d‘un lien entre un utilisateur et un centre de certification\n',
        ],
        tags: ['api', 'certification-center-membership'],
      },
    },

    {
      method: 'PATCH',
      path: '/api/admin/certification-center-memberships/{id}',
      config: {
        handler: certificationCenterMembershipController.updateFromPixAdmin,
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant les droits d'accès**\n" +
            "- Modification des informations d'un membre d'un centre de certification\n",
        ],
        tags: ['api', 'certification-center-membership'],
      },
    },
  ];

  server.route([...globalRoutes, ...adminRoutes]);
};

const name = 'certification-center-memberships-api';
export { register, name };
