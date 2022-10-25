const securityPreHandlers = require('../security-pre-handlers');
const stagesController = require('./stages-controller');
const Joi = require('joi');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/stages',
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
          payload: Joi.object({
            data: {
              attributes: {
                threshold: Joi.number().required().integer().min(0).max(100).allow(null),
                level: Joi.number().required().integer().min(0).max(8).allow(null),
                title: Joi.string().required(),
                message: Joi.string().required(),
                'prescriber-title': Joi.string().required().allow(null),
                'prescriber-description': Joi.string().required().allow(null),
              },
              relationships: {
                'target-profile': {
                  data: {
                    id: Joi.number().required(),
                  },
                },
              },
            },
          }).options({ allowUnknown: true }),
        },
        handler: stagesController.create,
        tags: ['api', 'admin', 'stages'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/stages/{id}',
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
            id: identifiersType.stageId,
          }),
        },
        handler: stagesController.getStageDetails,
        tags: ['api', 'stages'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer un palier.',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/stages/{id}',
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
            id: identifiersType.stageId,
          }),
          payload: Joi.object({
            data: {
              attributes: {
                threshold: Joi.number().required().integer().min(0).max(100).allow(null),
                level: Joi.number().required().integer().min(0).max(8).allow(null),
                title: Joi.string().required().allow(null),
                message: Joi.string().required().allow(null),
                'prescriber-title': Joi.string().required().allow(null),
                'prescriber-description': Joi.string().required().allow(null),
              },
            },
          }).options({ allowUnknown: true }),
        },
        handler: stagesController.updateStage,
        tags: ['api', 'admin', 'stages'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet de mettre à jour le prescriberTitle et le prescriberDescription d'un palier.",
        ],
      },
    },
  ]);
};

exports.name = 'stages-api';
