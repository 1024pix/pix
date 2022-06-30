const tubeController = require('./tube-controller');
const securityPreHandlers = require('../security-pre-handlers');
const Joi = require('joi');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/tubes/{id}/skills',
      config: {
        handler: tubeController.listSkills,
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.userHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkUserHasRoleSupport,
                securityPreHandlers.checkUserHasRoleMetier,
              ])(request, h),
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.tubeId,
          }),
        },
        tags: ['api', 'admin', 'tubes', 'skills'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin, Support ou Métier',
          "Elle permet de récupérer tous les acquis d'un sujet",
        ],
      },
    },
  ]);
};

exports.name = 'tubes-api';
