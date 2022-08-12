const adminMemberController = require('./admin-member-controller');
const securityPreHandlers = require('../security-pre-handlers');
const identifiersType = require('../../domain/types/identifiers-type');
const Joi = require('joi');

exports.register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/admin-members',
      config: {
        handler: adminMemberController.findAll,
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        notes: [
          "- **Cette route est restreinte aux utilisateurs ayant le droit d'accès SUPER_ADMIN**\n" +
            '- Lister les utilisateurs ayant accès à Pix Admin \n',
        ],
        tags: ['api', 'admin-members'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/admin-members/me',
      config: {
        handler: adminMemberController.getCurrentAdminMember,
        notes: [
          "- **Cette route n'est pas restreinte**\n" +
            '- Récupération du membre admin pix courant ayant accès à Pix Admin\n',
        ],
        tags: ['api', 'admin-members', 'current-member'],
      },
    },

    {
      method: 'PATCH',
      path: '/api/admin/admin-members/{id}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.adminMemberId,
          }),
          payload: Joi.object({
            data: Joi.object({
              attributes: Joi.object({
                role: Joi.string().valid('SUPER_ADMIN', 'SUPPORT', 'METIER', 'CERTIF'),
              }),
            }),
          }),
          options: {
            allowUnknown: true,
          },
        },
        handler: adminMemberController.updateAdminMember,
        notes: [
          "- Cette route est restreinte aux utilisateurs ayant le droit d'accès SUPER_ADMIN\n" +
            "- Elle permet de changer le rôle d'un membre Pix Admin",
        ],
        tags: ['api', 'admin-members'],
      },
    },
    {
      method: 'PUT',
      path: '/api/admin/admin-members/{id}/deactivate',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.adminMemberId,
          }),
        },
        handler: adminMemberController.deactivateAdminMember,
        notes: [
          "- Cette route est restreinte aux utilisateurs ayant le droit d'accès SUPER_ADMIN\n" +
            '- Elle permet de désactiver un membre Pix Admin',
        ],
        tags: ['api', 'admin-members', 'deactivate'],
      },
    },
  ]);
};

exports.name = 'admin-members-api';
