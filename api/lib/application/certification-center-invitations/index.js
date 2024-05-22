import Joi from 'joi';

import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { certificationCenterInvitationController } from './certification-center-invitation-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/certification-center-invitations/{id}/accept',
      config: {
        auth: false,
        handler: certificationCenterInvitationController.acceptCertificationCenterInvitation,
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
      method: 'DELETE',
      path: '/api/certification-center-invitations/{certificationCenterInvitationId}',
      config: {
        handler: certificationCenterInvitationController.cancelCertificationCenterInvitation,
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationId,
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
        tags: ['api', 'certification-center-invitation'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/certification-center-invitations/{certificationCenterInvitationId}',
      config: {
        handler: certificationCenterInvitationController.resendCertificationCenterInvitation,
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminOfCertificationCenterWithCertificationCenterInvitationId,
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
          "- Cette route permet de renvoyer une invitation en attente selon un **id d'invitation**",
        ],
        tags: ['api', 'certification-center-invitation'],
      },
    },
  ]);
};

const name = 'certification-center-invitations-api';
export { name, register };
