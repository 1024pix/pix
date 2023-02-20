import Joi from 'joi';
import trainingsController from './training-controller';
import identifiersType from '../../domain/types/identifiers-type';
import securityPreHandlers from '../security-pre-handlers';
import { sendJsonApiError, NotFoundError } from '../http-errors';

export const register = async (server) => {
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
            'page[number]': Joi.number().integer().empty('').allow(null).optional(),
            'page[size]': Joi.number().integer().empty('').allow(null).optional(),
          }),
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
                type: Joi.string().valid('autoformation', 'webinaire').required(),
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
                type: Joi.string().valid('autoformation', 'webinaire').allow(null),
                locale: Joi.string().valid('fr-fr', 'fr', 'en-gb').allow(null),
                'editor-name': Joi.string().allow(null),
                'editor-logo-url': Joi.string().allow(null),
              }),
              type: Joi.string().valid('trainings'),
            }).required(),
          }).required(),
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
              }),
              relationships: Joi.object({
                tubes: Joi.object({
                  data: Joi.array().items(
                    Joi.object({
                      id: identifiersType.tubeId.required(),
                      type: Joi.string().valid('tubes').required(),
                    })
                  ),
                }),
              }),
              type: Joi.string().valid('training-triggers'),
            }).required(),
            included: Joi.array()
              .items(
                Joi.object({
                  attributes: Joi.object({
                    id: identifiersType.tubeId.required(),
                    level: Joi.number().min(0).max(8).required(),
                  }),
                }).required()
              )
              .required(),
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
              h
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

export const name = 'trainings-api';
