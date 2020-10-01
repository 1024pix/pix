const Joi = require('@hapi/joi');
const { sendJsonApiError, BadRequestError } = require('../http-errors');
const securityPreHandlers = require('../security-pre-handlers');
const targetProfileController = require('./target-profile-controller');

exports.register = async (server) => {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/target-profiles',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          options: {
            allowUnknown: true,
          },
          query: Joi.object({
            'filter[id]': Joi.number().integer().empty('').allow(null).optional(),
            'filter[name]': Joi.string().empty('').allow(null).optional(),
            'page[number]': Joi.number().integer().empty('').allow(null).optional(),
            'page[size]': Joi.number().integer().empty('').allow(null).optional(),
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new BadRequestError('Un des champs de recherche saisis est invalide.'), h);
          },
        },
        handler: targetProfileController.findPaginatedFilteredTargetProfiles,
        tags: ['api', 'target-profiles'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de récupérer & chercher une liste de profils cible\n' +
          '- Cette liste est paginée et filtrée selon un **id** et/ou un **name** donnés',
        ],
      },
    },
  ]);
};

exports.name = 'target-profiles-api';
