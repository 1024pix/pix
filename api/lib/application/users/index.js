import Joi from 'joi';

import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { userController } from './user-controller.js';

const register = async function (server) {
  const adminRoutes = [
    {
      method: 'GET',
      path: '/api/admin/users/{id}/organizations',
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
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.findUserOrganizationsForAdmin,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet à un administrateur de lister les organisations auxquelles appartient l´utilisateur',
        ],
        tags: ['api', 'admin', 'user', 'organizations'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/users/{id}/certification-center-memberships',
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
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.findCertificationCenterMembershipsByUser,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet à un administrateur de lister les centres de certification auxquels appartient l´utilisateur',
        ],
        tags: ['api', 'admin', 'user', 'certification-centers'],
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
        handler: userController.addPixAuthenticationMethodByEmail,
        notes: ["- Permet à un administrateur d'ajouter une méthode de connexion Pix à un utilisateur"],
        tags: ['api', 'admin', 'user'],
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
        handler: userController.reassignAuthenticationMethods,
        notes: ["- Permet à un administrateur de déplacer une méthode de connexion GAR d'un utilisateur à un autre"],
        tags: ['api', 'admin', 'user', 'authentication-method'],
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
        handler: userController.removeAuthenticationMethod,
        notes: ['- Permet à un administrateur de supprimer une méthode de connexion'],
        tags: ['api', 'admin', 'user'],
      },
    },
  ];

  server.route([
    ...adminRoutes,
    {
      method: 'GET',
      path: '/api/users/{id}/trainings',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        handler: userController.findPaginatedUserRecommendedTrainings,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Elle permet la récupération des contenus formatifs de l'utilisateur courant.",
        ],
        tags: ['api', 'user', 'trainings'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/remember-user-has-seen-assessment-instructions',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.rememberUserHasSeenAssessmentInstructions,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Sauvegarde le fait que l'utilisateur ait vu le didacticiel" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
          "- Le contenu de la requête n'est pas pris en compte.",
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/has-seen-challenge-tooltip/{challengeType}',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
            challengeType: Joi.string().valid('focused', 'other'),
          }),
        },
        handler: userController.rememberUserHasSeenChallengeTooltip,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Sauvegarde le fait que l'utilisateur ait vu la tooltip de type d'épreuve" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
          "- Le contenu de la requête n'est pas pris en compte.",
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'POST',
      path: '/api/users/{userId}/competences/{competenceId}/reset',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        validate: {
          params: Joi.object({
            userId: identifiersType.userId,
            competenceId: identifiersType.competenceId,
          }),
        },
        handler: userController.resetScorecard,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Cette route réinitialise le niveau d'un utilisateur donné (**userId**) pour une compétence donnée (**competenceId**)",
          '- Cette route retourne les nouvelles informations de niveau de la compétence',
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'scorecard'],
      },
    },
  ]);
};

const name = 'users-api';
export { name, register };
