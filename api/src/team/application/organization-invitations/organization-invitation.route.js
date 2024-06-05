import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { organizationInvitationController } from './organization-invitation.controller.js';

export const organizationInvitationRoutes = [
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
      tags: ['api', 'invitations', 'SCO'],
    },
  },
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
      tags: ['api', 'invitations'],
    },
  },
];
