import Joi from 'joi';

import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { targetProfileController } from './admin-target-profile-controller.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/target-profiles/{id}/learning-content-pdf',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.targetProfileId,
          }),
          query: Joi.object({
            language: Joi.string().valid('fr', 'en').required(),
          }),
        },
        handler: targetProfileController.getLearningContentAsPdf,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer le référentiel du profil cible en version pdf',
        ],
        tags: ['api', 'learning-content', 'target-profile', 'PDF'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/target-profiles/{id}/content-json',
      config: {
        auth: false,
        validate: {
          params: Joi.object({
            id: identifiersType.targetProfileId,
          }),
        },
        handler: targetProfileController.getContentAsJsonFile,
        tags: ['api', 'admin', 'target-profiles', 'json'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer le profil cible dans un fichier json',
        ],
      },
    },
  ]);
};

const name = 'admin-target-profiles-api';
export { register, name };
