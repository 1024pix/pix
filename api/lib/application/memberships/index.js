const Joi = require('joi');

const securityPreHandlers = require('../security-pre-handlers');
const membershipController = require('./membership-controller');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function (server) {
  server.route([
    {
      method: 'POST',
      path: '/api/admin/memberships',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        handler: membershipController.create,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin**\n' +
            '- Elle permet de donner l’accès à une organisation, avec un rôle particulier pour un utilisateur donné',
        ],
        plugins: {
          'hapi-swagger': {
            payloadType: 'form',
            order: 1,
          },
        },
        tags: ['api', 'memberships'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/memberships/{id}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInOrganization,
            assign: 'isAdminInOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.membershipId,
          }),
        },
        handler: membershipController.update,
        description: 'Update organization role by admin for a organization members',
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés en tant qu'administrateur de l'organisation**\n" +
            "- Elle permet de modifier le rôle d'un membre de l'organisation",
        ],
        plugins: {
          'hapi-swagger': {
            payloadType: 'form',
            order: 2,
          },
        },
        tags: ['api', 'memberships'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/memberships/{id}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.membershipId,
          }),
        },
        handler: membershipController.update,
        description: 'Update organization role by admin for a organization members',
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés en tant que Super Admin**\n' +
            "- Elle permet de modifier le rôle d'un membre de l'organisation",
        ],
        plugins: {
          'hapi-swagger': {
            payloadType: 'form',
            order: 2,
          },
        },
        tags: ['api', 'memberships'],
      },
    },
    {
      method: 'POST',
      path: '/api/memberships/{id}/disable',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserIsAdminInOrganization,
            assign: 'isAdminInOrganization',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.membershipId,
          }),
        },
        handler: membershipController.disable,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés en tant qu'administrateur de l'organisation\n" +
            "- Elle permet la désactivation d'un membre",
        ],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/memberships/{id}/disable',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkUserHasRoleSuperAdmin,
            assign: 'hasRoleSuperAdmin',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.membershipId,
          }),
        },
        handler: membershipController.disable,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin**\n' +
            "- Elle permet la désactivation d'un membre",
        ],
      },
    },
  ]);
};

exports.name = 'memberships-api';
