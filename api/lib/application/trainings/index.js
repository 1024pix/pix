const Joi = require('joi');

const trainingsController = require('./training-controller');
const identifiersType = require('../../domain/types/identifiers-type');
const securityPreHandlers = require('../security-pre-handlers');

exports.register = async (server) => {
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
                duration: Joi.string().allow(null),
                type: Joi.string().valid('autoformation', 'webinaire').allow(null),
                locale: Joi.string().valid('fr-fr', 'fr', 'en-gb').allow(null),
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
  ]);
};

exports.name = 'trainings-api';
