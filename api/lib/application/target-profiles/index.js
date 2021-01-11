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
    {
      method: 'GET',
      path: '/api/admin/target-profiles/{id}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
        },
        handler: targetProfileController.getTargetProfileDetails,
        tags: ['api', 'target-profiles'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de récupérer toutes les informations d’un profil cible',
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/target-profiles/{id}/attach-organizations',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          payload: Joi.object({
            'organization-ids': Joi.array().items(Joi.number().integer()).required(),
          }),
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
        },
        handler: targetProfileController.attachOrganizations,
        tags: ['api', 'target-profiles'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de rattacher des organisations à un profil cible',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/target-profiles/{id}/organizations',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
          query: Joi.object({
            'filter[id]': Joi.number().integer().empty('').allow(null).optional(),
            'filter[name]': Joi.string().empty('').allow(null).optional(),
            'filter[type]': Joi.string().empty('').allow(null).optional(),
            'filter[external-id]': Joi.string().empty('').allow(null).optional(),
            'page[number]': Joi.number().integer().empty('').allow(null).optional(),
            'page[size]': Joi.number().integer().empty('').allow(null).optional(),
          }).options({ allowUnknown: true }),
        },
        handler: targetProfileController.findPaginatedFilteredTargetProfileOrganizations,
        tags: ['api', 'target-profiles', 'organizations'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de récupérer les organizations auxquelles est rattaché le profil cible',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/target-profiles/{id}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
          payload: Joi.object({
            data: {
              attributes: {
                'name': Joi.string().required().min(1),
              },
            },
          }).options({ allowUnknown: true }),
        },
        handler: targetProfileController.updateTargetProfile,
        tags: ['api', 'target-profiles'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de mettre à jour le nom d\'un profil cible',
        ],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/target-profiles/{id}/badges',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required(),
          }),
        },
        handler: targetProfileController.findTargetProfileBadges,
        tags: ['api', 'target-profiles', 'badges'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de récupérer les badges attachés au profil cible',
        ],
      },
    },
  ]);
};

exports.name = 'target-profiles-api';
