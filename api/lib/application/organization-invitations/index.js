import Joi from 'joi';

import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { organizationInvitationController } from './organization-invitation-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/organization-invitations/{id}/response',
      config: {
        auth: false,
        handler: organizationInvitationController.acceptOrganizationInvitation,
        validate: {
          params: Joi.object({
            id: identifiersType.organizationInvitationId,
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
        notes: [
          "- Cette route permet d'accepter l'invitation à rejoindre une organisation, via un **code** et un **email**",
        ],
        tags: ['api', 'invitations'],
      },
    },
    {
      method: 'GET',
      path: '/api/organization-invitations/{id}',
      config: {
        auth: false,
        handler: organizationInvitationController.getOrganizationInvitation,
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
  ]);
};

const name = 'organization-invitation-api';
export { name, register };
