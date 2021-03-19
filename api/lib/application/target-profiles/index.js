const Joi = require('joi');

const { sendJsonApiError, BadRequestError } = require('../http-errors');
const securityPreHandlers = require('../security-pre-handlers');
const targetProfileController = require('./target-profile-controller');
const identifiersType = require('../../domain/types/identifiers-type');

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
            id: identifiersType.targetProfileId,
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
            id: identifiersType.targetProfileId,
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
      method: 'POST',
      path: '/api/admin/target-profiles',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
        }],
        validate: {
          payload: Joi.object({
            data: {
              attributes: {
                'name': Joi.string().required(),
                'is-public': Joi.boolean().required(),
                'owner-organization-id': Joi.string().pattern(/^[0-9]+$/, 'numbers').empty('').allow(null).optional(),
                'image-url': Joi.string().uri().empty('').allow(null).optional(),
                'skills-id': Joi.array().required(),
              },
            },
          }),
          options: {
            allowUnknown: true,
          },
        },
        handler: targetProfileController.createTargetProfile,
        tags: ['api', 'target-profiles', 'create'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de créer un profil cible avec ses acquis',
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
            id: identifiersType.targetProfileId,
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
      method: 'PUT',
      path: '/api/admin/target-profiles/{id}/outdate',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.targetProfileId,
          }),
        },
        handler: targetProfileController.outdateTargetProfile,
        tags: ['api', 'target-profiles'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de marquer un profil cible comme obsolète',
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
            id: identifiersType.targetProfileId,
          }),
          payload: Joi.object({
            data: {
              attributes: {
                'name': Joi.string().required().min(1),
              },
            },
          }).options({ allowUnknown: true }),
        },
        handler: targetProfileController.updateTargetProfileName,
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
            id: identifiersType.targetProfileId,
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
    {
      method: 'GET',
      path: '/api/admin/target-profiles/{id}/stages',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.targetProfileId,
          }),
        },
        handler: targetProfileController.findByTargetProfileId,
        tags: ['api', 'target-profiles', 'stages'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de récupérer les paliers attachés au profil cible',
        ],
      },
    },
  ]);
};

exports.name = 'target-profiles-api';
