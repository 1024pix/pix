import Joi from 'joi';

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
];
