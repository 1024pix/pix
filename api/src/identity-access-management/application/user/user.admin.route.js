import Joi from 'joi';

import { BadRequestError, sendJsonApiError } from '../../../shared/application/http-errors.js';
import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { getSupportedLanguages, getSupportedLocales } from '../../../shared/domain/services/locale-service.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { QUERY_TYPES } from '../../domain/constants/user-query.js';
import { userAdminController } from './user.admin.controller.js';

export const userAdminRoutes = [
  {
    method: 'PUT',
    path: '/api/admin/users/{id}/unblock',
    config: {
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
      },
      pre: [
        {
          method: (request, h) =>
            securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
            ])(request, h),
        },
      ],
      handler: userAdminController.unblockUserAccount,
      notes: ["- Permet à un administrateur de débloquer le compte d'un utilisateur"],
      tags: ['api', 'user-account', 'admin'],
    },
  },
  {
    method: 'GET',
    path: '/api/admin/users',
    config: {
      pre: [
        {
          method: (request, h) =>
            securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleCertif,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
              securityPreHandlers.checkAdminMemberHasRoleMetier,
            ])(request, h),
        },
      ],
      validate: {
        options: {
          allowUnknown: true,
        },
        query: Joi.object({
          filter: Joi.object({
            id: identifiersType.userId.empty('').allow(null).optional(),
            firstName: Joi.string().empty('').allow(null).optional(),
            lastName: Joi.string().empty('').allow(null).optional(),
            email: Joi.string().empty('').allow(null).optional(),
            username: Joi.string().empty('').allow(null).optional(),
          }).default({}),
          page: Joi.object({
            number: Joi.number().integer().empty('').allow(null).optional(),
            size: Joi.number().integer().empty('').allow(null).optional(),
          }).default({}),
          queryType: Joi.string()
            .valid(QUERY_TYPES.CONTAINS, QUERY_TYPES.EXACT_QUERY)
            .default(QUERY_TYPES.CONTAINS)
            .optional(),
        }),
      },
      handler: (request, h) => userAdminController.findPaginatedFilteredUsers(request, h),
      notes: [
        "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
          '- Elle permet de récupérer & chercher une liste d’utilisateurs\n' +
          '- Cette liste est paginée et filtrée selon un **id**, **firstName**, un **lastName**, un **email** et **identifiant** donnés',
      ],
      tags: ['api', 'admin', 'user'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/admin/users/{id}',
    config: {
      pre: [
        {
          method: (request, h) =>
            securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
            ])(request, h),
        },
      ],
      plugins: {
        'hapi-swagger': {
          payloadType: 'form',
        },
      },
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
        payload: Joi.object({
          data: {
            attributes: {
              'first-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
              'last-name': Joi.string().empty(Joi.string().regex(/^\s*$/)).required(),
              email: Joi.string().email().allow(null).optional(),
              username: Joi.string().allow(null).optional(),
              lang: Joi.string().valid(...getSupportedLanguages()),
              locale: Joi.string()
                .allow(null)
                .optional()
                .valid(...getSupportedLocales()),
            },
          },
        }),
        options: {
          allowUnknown: true,
        },
      },
      handler: (request, h) => userAdminController.updateUserDetailsByAdmin(request, h),
      notes: [
        "- Permet à un administrateur de mettre à jour certains attributs d'un utilisateur identifié par son identifiant",
      ],
      tags: ['api', 'admin', 'identity-access-management'],
    },
  },
  {
    method: 'GET',
    path: '/api/admin/users/{id}',
    config: {
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
        failAction: (request, h) => {
          return sendJsonApiError(new BadRequestError("L'identifiant de l'utilisateur n'est pas au bon format."), h);
        },
      },
      pre: [
        {
          method: (request, h) =>
            securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleCertif,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
              securityPreHandlers.checkAdminMemberHasRoleMetier,
            ])(request, h),
        },
      ],
      handler: (request, h) => userAdminController.getUserDetails(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs administrateurs**\n' +
          "- Elle permet de récupérer le détail d'un utilisateur dans un contexte d'administration",
      ],
      tags: ['api', 'admin', 'identity-access-management', 'user'],
    },
  },
  {
    method: 'POST',
    path: '/api/admin/users/{id}/anonymize',
    config: {
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
      },
      pre: [
        {
          method: (request, h) =>
            securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
            ])(request, h),
        },
      ],
      handler: (request, h) => userAdminController.anonymizeUser(request, h),
      notes: ["- Permet à un administrateur d'anonymiser un utilisateur"],
      tags: ['api', 'admin', 'identity-access-management', 'user'],
    },
  },
  {
    method: 'POST',
    path: '/api/admin/users/{id}/add-pix-authentication-method',
    config: {
      pre: [
        {
          method: (request, h) =>
            securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
            ])(request, h),
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
        payload: Joi.object({
          data: {
            attributes: {
              email: Joi.string().email().required(),
            },
          },
        }),
        options: {
          allowUnknown: true,
        },
      },
      handler: (request, h) => userAdminController.addPixAuthenticationMethod(request, h),
      notes: ["- Permet à un administrateur d'ajouter une méthode de connexion Pix à un utilisateur"],
      tags: ['api', 'identity-access-management', 'admin', 'user'],
    },
  },
  {
    method: 'POST',
    path: '/api/admin/users/{userId}/authentication-methods/{authenticationMethodId}',
    config: {
      validate: {
        params: Joi.object({
          userId: identifiersType.userId,
          authenticationMethodId: identifiersType.authenticationMethodId,
        }),
        payload: Joi.object({
          data: {
            attributes: {
              'user-id': identifiersType.userId,
            },
          },
        }),
        options: {
          abortEarly: false,
        },
      },
      pre: [
        {
          method: (request, h) =>
            securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
            ])(request, h),
        },
      ],
      handler: (request, h) => userAdminController.reassignAuthenticationMethod(request, h),
      notes: ["- Permet à un administrateur de déplacer une méthode de connexion GAR d'un utilisateur à un autre"],
      tags: ['api', 'admin', 'identity-access-management', 'user'],
    },
  },
  {
    method: 'POST',
    path: '/api/admin/users/{id}/remove-authentication',
    config: {
      pre: [
        {
          method: (request, h) =>
            securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
            ])(request, h),
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
        payload: Joi.object({
          data: {
            attributes: {
              type: Joi.string().required(),
            },
          },
        }),
        options: {
          allowUnknown: true,
        },
      },
      handler: (request, h) => userAdminController.removeAuthenticationMethod(request, h),
      notes: ['- Permet à un administrateur de supprimer une méthode de connexion'],
      tags: ['api', 'identity-access-management', 'admin', 'user'],
    },
  },
];
