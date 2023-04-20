const Joi = require('joi');
const securityPreHandlers = require('../security-pre-handlers.js');
const stageCollectionController = require('./stage-collection-controller');
const identifiersType = require('../../domain/types/identifiers-type.js');

exports.register = async (server) => {
  server.route([
    {
      method: 'PATCH',
      path: '/api/admin/stage-collections/{id}',
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
        },
        handler: stageCollectionController.update,
        tags: ['api', 'admin', 'stage-collections'],
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            "- Elle permet de modifier une collection de paliers d'un profil cible",
        ],
      },
    },
  ]);
};

exports.name = 'stage-collections-api';
