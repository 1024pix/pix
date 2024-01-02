import Joi from 'joi';
import { autonomousCourseController } from './autonomous-course-controller.js';
import { autonomousCourseTargetProfileController } from './autonomous-course-target-profile-controller.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { sendJsonApiError, BadRequestError } from '../../../../lib/application/http-errors.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';

const register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/autonomous-courses',
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
        handler: autonomousCourseController.save,
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string().valid('autonomous-courses'),
              attributes: Joi.object({
                'target-profile-id': identifiersType.targetProfileId.required(),
                'internal-title': Joi.string().required(),
                'public-title': Joi.string().required(),
                'custom-landing-page-text': Joi.string().allow(null).optional(),
              }),
            }),
          }),
        },
        notes: [
          '- **Route nécessitant une authentification**\n' + '- Cette route permet de créer un parcours autonome.',
        ],
        tags: ['api', 'autonomous-courses'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/autonomous-courses/{autonomousCourseId}',
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
        handler: autonomousCourseController.update,
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string().valid('autonomous-courses'),
              attributes: Joi.object({
                'internal-title': Joi.string().required(),
                'public-title': Joi.string().required(),
                'custom-landing-page-text': Joi.string().allow(null).optional(),
              }),
            }),
          }),
        },
        notes: [
          '- **Route nécessitant une authentification**\n' +
            '- Cette route permet de mettre à jour un parcours autonome.',
        ],
        tags: ['api', 'autonomous-courses'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/autonomous-courses',
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
          query: Joi.object({
            'page[number]': Joi.number().integer().empty('').allow(null).optional(),
            'page[size]': Joi.number().integer().empty('').allow(null).optional(),
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new BadRequestError('Un des champs de pagination saisis est invalide.'), h);
          },
        },
        handler: autonomousCourseController.findPaginatedList,
        notes: [
          '- **Route nécessitant une authentification**\n' +
            '- Cette route renvoie une liste paginée des parcours autonomes\n',
        ],
        tags: ['api', 'autonomous-courses'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/autonomous-courses/{autonomousCourseId}',
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
            autonomousCourseId: identifiersType.autonomousCourseId,
          }),
        },
        handler: autonomousCourseController.getById,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer un parcours autonome spécifique',
        ],
        tags: ['api', 'admin', 'autonomous-courses'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/autonomous-courses/target-profiles',
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
        handler: autonomousCourseTargetProfileController.get,
        notes: [
          '- **Route nécessitant une authentification**\n' +
            '- Cette route renvoie la liste des profils cibles pour les parcours autonomes\n',
        ],
        tags: ['api', 'autonomous-courses'],
      },
    },
  ]);
};

const name = 'autonomous-courses-api';
export { register, name };
