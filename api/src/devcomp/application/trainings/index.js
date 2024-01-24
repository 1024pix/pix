import Joi from 'joi';

import { trainingController as trainingsController } from './training-controller.js';
import { identifiersType } from '../../../../lib/domain/types/identifiers-type.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { sendJsonApiError, NotFoundError, BadRequestError } from '../../../../lib/application/http-errors.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/training-summaries',
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
          options: {
            allowUnknown: true,
          },
          query: Joi.object({
            'filter[id]': Joi.number().empty('').allow(null).optional(),
            'filter[title]': Joi.string().empty('').allow(null).optional(),
            'page[number]': Joi.number().integer().empty('').allow(null).optional(),
            'page[size]': Joi.number().integer().empty('').allow(null).optional(),
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new BadRequestError('Un des champs de recherche saisis est invalide.'), h);
          },
        },
        handler: trainingsController.findPaginatedTrainingSummaries,
        tags: ['api', 'admin', 'trainings'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer une liste paginée de résumés de contenus formatifs',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/trainings/{trainingId}',
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
            trainingId: identifiersType.trainingId,
          }),
        },
        handler: trainingsController.getById,
        tags: ['api', 'admin', 'trainings'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer un contenu formatif spécifique',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/trainings/{trainingId}/target-profile-summaries',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            trainingId: identifiersType.trainingId,
          }),
        },
        handler: trainingsController.findTargetProfileSummaries,
        tags: ['api', 'admin', 'trainings', 'target-profile-summaries'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer les résumés des profils cibles associés à un contenu formatif spécifique',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/trainings',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
          },
        ],
        handler: trainingsController.create,
        validate: {
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                link: Joi.string().uri().required(),
                title: Joi.string().required(),
                duration: Joi.object({
                  days: Joi.number().min(0).default(0),
                  hours: Joi.number().min(0).max(23).default(0),
                  minutes: Joi.number().min(0).max(59).default(0),
                }).required(),
                type: Joi.string()
                  .valid('autoformation', 'e-learning', 'hybrid-training', 'in-person-training', 'webinaire')
                  .required(),
                locale: Joi.string().valid('fr-fr', 'fr', 'en-gb').required(),
                'editor-name': Joi.string().required(),
                'editor-logo-url': Joi.string().uri().required(),
              }),
              type: Joi.string().valid('trainings'),
            }).required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        tags: ['api', 'admin', 'trainings'],
        notes: ['- Permet à un administrateur de créer un nouveau contenu formatif'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/trainings/{trainingId}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
          },
        ],
        handler: trainingsController.update,
        validate: {
          params: Joi.object({
            trainingId: identifiersType.trainingId,
          }),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                link: Joi.string().allow(null),
                title: Joi.string().allow(null),
                duration: Joi.object({
                  days: Joi.number().min(0).required(),
                  hours: Joi.number().min(0).max(23).required(),
                  minutes: Joi.number().min(0).max(59).required(),
                }).allow(null),
                type: Joi.string()
                  .valid('autoformation', 'e-learning', 'hybrid-training', 'in-person-training', 'webinaire')
                  .allow(null),
                locale: Joi.string().valid('fr-fr', 'fr', 'en-gb').allow(null),
                'editor-name': Joi.string().allow(null),
                'editor-logo-url': Joi.string().allow(null),
              }),
              type: Joi.string().valid('trainings'),
            }).required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        tags: ['api', 'admin', 'trainings'],
        notes: [
          "- Permet à un administrateur de mettre à jour les attributs d'un contenu formatif par son identifiant",
        ],
      },
    },
    {
      method: 'PUT',
      path: '/api/admin/trainings/{trainingId}/triggers',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
          },
        ],
        handler: trainingsController.createOrUpdateTrigger,
        validate: {
          params: Joi.object({
            trainingId: identifiersType.trainingId,
          }),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                type: Joi.string().valid('prerequisite', 'goal').required(),
                threshold: Joi.number().min(0).max(100).required(),
                tubes: Joi.array().items(
                  Joi.object({
                    tubeId: identifiersType.tubeId.required(),
                    level: Joi.number().min(0).max(8).required(),
                  }),
                ),
              }),
              type: Joi.string().valid('training-triggers'),
            }).required(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        tags: ['api', 'admin', 'trainings'],
        notes: [
          "- Permet à un administrateur de créer ou de mettre à jour le déclencheur d'un contenu formatif par son identifiant",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/trainings/{id}/attach-target-profiles',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
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
            id: identifiersType.trainingId,
          }),
          failAction: (_request, h) => {
            return sendJsonApiError(
              new NotFoundError("L'id d'un des profils cible ou du contenu formatif n'est pas valide"),
              h,
            );
          },
        },
        handler: trainingsController.attachTargetProfiles,
        tags: ['api', 'admin', 'target-profiles', 'trainings'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de rattacher des profil cibles à un contenu formatif',
        ],
      },
    },
  ]);
};

const name = 'trainings-api';
export { register, name };
