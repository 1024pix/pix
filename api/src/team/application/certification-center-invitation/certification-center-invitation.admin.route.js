import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { certificationCenterInvitationAdminController } from './certification-center-invitation.admin.controller.js';

export const certificationCenterInvitationAdminRoutes = [
  {
    method: 'POST',
    path: '/api/admin/certification-centers/{certificationCenterId}/invitations',
    config: {
      pre: [
        {
          method: (request, h) =>
            securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleCertif,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
              securityPreHandlers.checkAdminMemberHasRoleMetier,
            ])(request, h),
          assign: 'hasAuthorizationToAccessAdminScope',
        },
      ],
      handler: certificationCenterInvitationAdminController.sendInvitationForAdmin,
      validate: {
        params: Joi.object({
          certificationCenterId: identifiersType.certificationCenterId,
        }),
        options: {
          allowUnknown: true,
        },
        payload: Joi.object({
          data: {
            attributes: {
              email: Joi.string().email().required(),
              language: Joi.string().valid('fr-fr', 'fr', 'en'),
              role: Joi.string().valid('ADMIN', 'MEMBER').allow(null),
            },
          },
        }),
      },
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
          "- Elle permet à un administrateur d'inviter des personnes, déjà utilisateurs de Pix ou non, à être membre d'un centre de certification, via leur **email**",
      ],
      tags: ['api', 'admin', 'invitations', 'certification-center'],
    },
  },
];
