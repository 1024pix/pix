const Joi = require('@hapi/joi');
const JSONAPIError = require('jsonapi-serializer').Error;
const securityPreHandlers = require('../security-pre-handlers');
const membershipController = require('./membership-controller');
const { idSpecification } = require('../../domain/validators/id-specification');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/memberships',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: membershipController.create,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de donner l’accès à une organisation, avec un rôle particulier pour un utilisateur donné'
        ],
        plugins: {
          'hapi-swagger': {
            payloadType: 'form',
            order: 1
          }
        },
        tags: ['api', 'memberships']
      }
    },
    {
      method: 'PATCH',
      path: '/api/memberships/{id}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserIsAdminInOrganizationOrHasRolePixMaster,
          assign: 'isAdminInOrganizationOrHasRolePixMaster'
        }],
        validate: {
          params: Joi.object({
            id: Joi.number().integer().required()
          }),
          failAction: (request, h, err) => {
            const errorHttpStatusCode = 400;
            const jsonApiError = new JSONAPIError({
              code: errorHttpStatusCode.toString(),
              title: 'Bad request',
              detail: err.details[0].message,
            });
            return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
          },
        },
        handler: membershipController.update,
        description: 'Update organization role by admin for a organization members',
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés en tant qu\'administrateur de l\'organisation ou ayant le rôle Pix Master**\n' +
          '- Elle permet de modifier le rôle d\'un membre de l\'organisation'
        ],
        plugins: {
          'hapi-swagger': {
            payloadType: 'form',
            order: 2
          }
        },
        tags: ['api','memberships'],
      }
    },
    {
      method: 'POST',
      path: '/api/memberships/{id}/disable',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        validate: {
          params: Joi.object({
            id: idSpecification
          })
        },
        handler: membershipController.disable,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet la désactivation d\'un membre'
        ],
      }
    },
  ]);
};

exports.name = 'memberships-api';
