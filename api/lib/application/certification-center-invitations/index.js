import Joi from 'joi';

import { certificationCenterInvitationController } from './certification-center-invitation-controller.js';
import { identifiersType } from '../../domain/types/identifiers-type.js';
import { securityPreHandlers } from '../security-pre-handlers.js';

const register = async function (server) {
  const adminRoutes = [
    {
      method: 'DELETE',
      path: '/api/admin/certification-center-invitations/{certificationCenterInvitationId}',
      config: {
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
        validate: {
          params: Joi.object({
            certificationCenterInvitationId: identifiersType.certificationCenterInvitationId,
          }),
        },
        handler: certificationCenterInvitationController.cancelCertificationCenterInvitation,
        tags: ['api', 'admin', 'invitations', 'cancel'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet d'annuler une invitation envoyée mais non acceptée encore.",
        ],
      },
    },
  ];

  server.route([
    ...adminRoutes,
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
  ]);
};

const name = 'certification-center-invitations-api';
export { register, name };
