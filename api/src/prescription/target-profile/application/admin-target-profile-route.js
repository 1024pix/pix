import Joi from 'joi';

import { NotFoundError, sendJsonApiError } from '../../../../lib/application/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { targetProfileController } from './admin-target-profile-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/target-profiles/{id}/copy-organizations',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          payload: Joi.object({
            'target-profile-id': Joi.number().integer().required(),
          }),
          params: Joi.object({
            id: identifiersType.targetProfileId,
          }),
        },
        handler: targetProfileController.attachOrganizationsFromExistingTargetProfile,
        tags: ['api', 'admin', 'target-profiles'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de rattacher à un profil cible donné les organisations d’un profil cible existant (id de ce dernier en payload)',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/target-profiles/{id}/learning-content-pdf',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
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
        tags: ['api', 'admin', 'target-profile', 'pdf'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/target-profiles/{id}/content-json',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
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
        },
        handler: targetProfileController.getContentAsJsonFile,
        tags: ['api', 'admin', 'target-profiles', 'json'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer le profil cible dans un fichier json',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/organizations/{id}/attach-target-profiles',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          payload: Joi.object({
            'target-profile-ids': Joi.array().items(Joi.number().integer()).required(),
          }),
          params: Joi.object({
            id: identifiersType.organizationId,
          }),
          failAction: (request, h) => {
            return sendJsonApiError(
              new NotFoundError("L'id d'un des profils cible ou de l'organisation n'est pas valide"),
              h,
            );
          },
        },
        handler: targetProfileController.attachTargetProfiles,
        tags: ['api', 'admin', 'target-profiles', 'organizations'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de rattacher des profil cibles à une organisation',
        ],
      },
    },
  ]);
};

const name = 'admin-target-profiles-api';
export { name, register };
