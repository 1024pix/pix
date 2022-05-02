const tubeController = require('./tube-controller');
const securityPreHandlers = require('../security-pre-handlers');
const Joi = require('joi');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/tubes/{id}/skills',
      config: {
        handler: tubeController.listSkills,
        pre: [{ method: securityPreHandlers.checkUserHasRoleSuperAdmin }],
        validate: {
          params: Joi.object({
            id: identifiersType.tubeId,
          }),
        },
        tags: ['api', 'tubes', 'skills'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          "Elle permet de récupérer tous les acquis d'un sujet",
        ],
      },
    },
  ]);
};

exports.name = 'tubes-api';
