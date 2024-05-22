import Joi from 'joi';

import { securityPreHandlers } from '../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../shared/domain/types/identifiers-type.js';
import { certificationCenterInvitationController } from './certification-center-invitation.controller.js';

export const certificationCenterInvitationRoutes = [
  {
    method: 'POST',
    path: '/api/certification-centers/{certificationCenterId}/invitations',
    config: {
      pre: [
        {
          method: securityPreHandlers.checkUserIsAdminOfCertificationCenter,
          assign: 'isAdminOfCertificationCenter',
        },
      ],
      validate: {
        params: Joi.object({
          certificationCenterId: identifiersType.certificationCenterId,
        }),
        payload: Joi.object({
          data: {
            attributes: {
              emails: Joi.array().items(Joi.string().email()).required(),
            },
          },
        }),
      },
      handler: certificationCenterInvitationController.sendInvitations,
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés en tant que responsables à un centre de certification**\n' +
          "- Elle permet d'inviter des personnes, déjà utilisateurs de Pix ou non, à être membre d'un centre de certification via leur **email**",
      ],
      tags: ['api', 'certification-center', 'invitations'],
    },
  },
];
