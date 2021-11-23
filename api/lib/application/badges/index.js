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
      method: 'POST',
      path: '/api/admin/badges/{id}/badge-criteria',
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
              attributes: Joi.object({
                scope: Joi.string().required(),
                threshold: Joi.number().min(0).max(100).required(),
              }).required(),
              relationships: Joi.object({
                'skill-sets': Joi.object({
                  data: Joi.array().items(
                    Joi.object({
                      id: identifiersType.badgeCriterionId,
                      type: Joi.string().required(),
                    })
                  ),
                }),
              }),
              type: Joi.string().required(),
            }).required(),
          }).required(),
        },
        handler: badgesController.createBadgeCriterion,
        tags: ['api', 'badges'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
            "- Elle permet de créer un critère et de l'ajouter au badge référencé par {id}.",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/badges/{id}/skill-sets',
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
              attributes: Joi.object({
                name: Joi.string().required(),
                'skill-ids': Joi.array().items(Joi.string()).required(),
              }).required(),
              type: Joi.string().required(),
            }).required(),
          }).required(),
        },
        handler: badgesController.createSkillSet,
        tags: ['api', 'badges'],
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
            "- Elle permet de créer un skillSet et de l'ajouter au badge référencé par {id}.",
        ],
      },
    },
  ]);
};

exports.name = 'badges-api';
