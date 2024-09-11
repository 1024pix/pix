import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
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
  {
    method: 'GET',
    path: '/api/certification-centers/{certificationCenterId}/invitations',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkUserIsAdminOfCertificationCenter(request, h),
          assign: 'isAdminOfCertificationCenter',
        },
      ],
      validate: {
        params: Joi.object({
          certificationCenterId: identifiersType.certificationCenterId,
        }),
      },
      handler: (request, h) => certificationCenterInvitationController.findPendingInvitations(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs appartenant à un centre de certification**\n' +
          '- Récupération de la liste des invitations en attente liée à un centre de certification',
      ],
      tags: ['api', 'certification-center', 'invitations'],
    },
  },
  {
    method: 'GET',
    path: '/api/certification-center-invitations/{id}',
    config: {
      auth: false,
      handler: certificationCenterInvitationController.getCertificationCenterInvitation,
      validate: {
        params: Joi.object({
          id: identifiersType.certificationCenterInvitationId.required(),
        }),
        query: Joi.object({
          code: Joi.string().required(),
        }),
      },
      notes: [
        "- Cette route permet de récupérer les détails d'une invitation selon un **id d'invitation** et un **code**\n",
      ],
      tags: ['api', 'invitations'],
    },
  },
  {
    method: 'POST',
    path: '/api/certification-center-invitations/{id}/accept',
    config: {
      auth: false,
      handler: (request, h) => certificationCenterInvitationController.acceptCertificationCenterInvitation(request, h),
      validate: {
        params: Joi.object({
          id: identifiersType.certificationCenterInvitationId,
        }),
        payload: Joi.object({
          data: {
            id: Joi.string().required(),
            type: Joi.string().required(),
            attributes: {
              code: Joi.string().required(),
              email: Joi.string().email().required(),
            },
          },
        }),
      },
      tags: ['api'],
    },
  },
  {
    method: 'DELETE',
    path: '/api/certification-center-invitations/{certificationCenterInvitationId}',
    config: {
      handler: (request, h) => certificationCenterInvitationController.cancelCertificationCenterInvitation(request, h),
      pre: [
        {
          method: (request, h) =>
            securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationId(request, h),
          assign: 'isAdminOfCertificationCenter',
        },
      ],
      validate: {
        params: Joi.object({
          certificationCenterInvitationId: identifiersType.certificationCenterInvitationId.required(),
        }),
      },
      notes: [
        '- **Cette route est restreinte aux utilisateurs appartenant à un centre de certification**\n',
        "- Cette route permet d'annuler une invitation actuellement en attente selon un **id d'invitation**",
      ],
      tags: ['team', 'api', 'certification-center-invitation'],
    },
  },
];
