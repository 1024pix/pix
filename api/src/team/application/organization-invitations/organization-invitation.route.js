import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { organizationInvitationController } from './organization-invitation.controller.js';

export const organizationInvitationRoutes = [
  {
    method: 'GET',
    path: '/api/organization-invitations/{id}',
    config: {
      auth: false,
      handler: (request, h) => organizationInvitationController.getOrganizationInvitation(request, h),
      validate: {
        params: Joi.object({
          id: identifiersType.organizationInvitationId,
        }),
        query: Joi.object({
          code: Joi.string().required(),
        }),
      },
      notes: [
        "- Cette route permet de récupérer les détails d'une invitation selon un **id d'invitation** et un **code**\n",
      ],
      tags: ['team', 'api', 'invitations'],
    },
  },
  {
    method: 'GET',
    path: '/api/organizations/{id}/invitations',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkUserIsAdminInOrganization(request, h),
          assign: 'isAdminInOrganization',
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.organizationId,
        }),
      },
      handler: (request, h) => organizationInvitationController.findPendingInvitations(request, h),
      tags: ['team', 'api', 'invitations'],
      notes: [
        "- Cette route est restreinte aux utilisateurs authentifiés responsables de l'organisation",
        "- Elle permet de lister les invitations en attente d'acceptation d'une organisation",
      ],
    },
  },
  {
    method: 'POST',
    path: '/api/organization-invitations/sco',
    config: {
      auth: false,
      handler: (request, h) => organizationInvitationController.sendScoInvitation(request, h),
      validate: {
        payload: Joi.object({
          data: {
            attributes: {
              uai: Joi.string().required(),
              'first-name': Joi.string().required(),
              'last-name': Joi.string().required(),
            },
            type: 'sco-organization-invitations',
          },
        }),
      },
      notes: [
        "- Cette route permet d'envoyer une invitation pour rejoindre une organisation de type SCO en tant que ADMIN, en renseignant un **UAI**, un **NOM** et un **PRÉNOM**",
      ],
      tags: ['team', 'api', 'invitations', 'SCO'],
    },
  },
  {
    method: 'DELETE',
    path: '/api/organizations/{id}/invitations/{organizationInvitationId}',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkUserIsAdminInOrganization(request, h),
          assign: 'isAdminInOrganization',
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.organizationId,
          organizationInvitationId: identifiersType.organizationInvitationId,
        }),
      },
      handler: (request, h) => organizationInvitationController.cancelOrganizationInvitation(request, h),
      tags: ['team', 'api', 'invitations', 'cancel'],
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés en tant qu'admin d'une organisation**\n" +
          "- Elle permet à l'administrateur de l'organisation d'annuler une invitation envoyée mais non acceptée encore.",
      ],
    },
  },
  {
    method: 'POST',
    path: '/api/organizations/{id}/invitations',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkUserIsAdminInOrganization(request, h),
          assign: 'isAdminInOrganization',
        },
      ],
      handler: (request, h) => organizationInvitationController.sendInvitations(request, h),
      validate: {
        params: Joi.object({
          id: identifiersType.organizationId,
        }),
        options: {
          allowUnknown: true,
        },
        payload: Joi.object({
          data: {
            attributes: {
              email: Joi.string().email({ multiple: true }).required(),
            },
          },
        }),
      },
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés en tant que responsables de l'organisation**\n" +
          "- Elle permet d'inviter des personnes, déjà utilisateurs de Pix ou non, à être membre d'une organisation, via leur **email**",
      ],
      tags: ['api', 'invitations'],
    },
  },
];
