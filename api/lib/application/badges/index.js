const securityPreHandlers = require('../security-pre-handlers');
const badgesController = require('./badges-controller');
const Joi = require('joi');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/badges/{id}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserHasRolePixMaster,
            assign: 'hasRolePixMaster',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.badgeId,
          }),
        },
        handler: badgesController.getBadge,
        tags: ['api', 'badges'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
            '- Elle permet de récupérer un résultat thématique.',
        ],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/badges/{id}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserHasRolePixMaster,
            assign: 'hasRolePixMaster',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.badgeId,
          }),
          payload: Joi.object({
            data: Joi.object({
              id: Joi.string().required(),
              attributes: Joi.object({
                key: Joi.string().required(),
                'alt-message': Joi.string().required(),
                'image-url': Joi.string().required(),
                message: Joi.string().required().allow(null),
                title: Joi.string().required().allow(null),
                'is-certifiable': Joi.boolean().required(),
                'is-always-visible': Joi.boolean().required(),
                'campaign-threshold': Joi.number().allow(null),
                'skill-set-threshold': Joi.number().allow(null),
                'skill-set-name': Joi.string().allow(null).allow(''),
                'skill-set-skills-ids': Joi.array().items(Joi.string()).allow(null),
              }).required(),
              type: Joi.string().required(),
              relationships: Joi.object(),
            }).required(),
          }).required(),
        },
        handler: badgesController.updateBadge,
        tags: ['api', 'badges'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
            '- Elle permet de modifier un résultat thématique.',
        ],
      },
    },
  ]);
};

exports.name = 'badges-api';
