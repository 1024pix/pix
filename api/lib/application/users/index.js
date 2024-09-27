import Joi from 'joi';

import { BadRequestError, sendJsonApiError } from '../../../src/shared/application/http-errors.js';
import { securityPreHandlers } from '../../../src/shared/application/security-pre-handlers.js';
import { SUPPORTED_LOCALES } from '../../../src/shared/domain/constants.js';
import { AVAILABLE_LANGUAGES } from '../../../src/shared/domain/services/language-service.js';
import { identifiersType } from '../../../src/shared/domain/types/identifiers-type.js';
import { userController } from './user-controller.js';

const register = async function (server) {
  const adminRoutes = [
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
        handler: userController.getUserDetailsForAdmin,
        notes: [
          '- **Cette route est restreinte aux utilisateurs administrateurs**\n' +
            "- Elle permet de récupérer le détail d'un utilisateur dans un contexte d'administration",
        ],
        tags: ['api', 'admin', 'user'],
      },
    },
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
                lang: Joi.string().valid(...AVAILABLE_LANGUAGES),
                locale: Joi.string()
                  .allow(null)
                  .optional()
                  .valid(...SUPPORTED_LOCALES),
              },
            },
          }),
          options: {
            allowUnknown: true,
          },
        },
        handler: userController.updateUserDetailsForAdministration,
        notes: [
          "- Permet à un administrateur de mettre à jour certains attributs d'un utilisateur identifié par son identifiant",
        ],
        tags: ['api', 'admin', 'user'],
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
        handler: userController.anonymizeUser,
        notes: ["- Permet à un administrateur d'anonymiser un utilisateur"],
        tags: ['api', 'admin', 'user'],
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
      path: '/api/users/{id}/campaign-participations',
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
        handler: userController.getCampaignParticipations,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération des participations à des campagnes à partir de l’id\n' +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié' +
            '- Les participations aux campagnes sont triées par ordre inverse de création' +
            '  (les plus récentes en premier)',
        ],
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/users/{id}/campaign-participation-overviews',
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
        handler: userController.getCampaignParticipationOverviews,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération des aperçus des participations aux campagnes en fonction de l‘id de l‘utilisateur\n' +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié' +
            '- Les aperçus des participations aux campagnes sont triés par ordre inverse de création' +
            '  (les plus récentes en premier)',
          '- Cette liste est paginée et filtrée selon des **states** qui peuvent avoir comme valeurs: ONGOING, TO_SHARE, ENDED et ARCHIVED',
        ],
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/users/{userId}/campaigns/{campaignId}/profile',
      config: {
        validate: {
          params: Joi.object({
            userId: identifiersType.userId,
            campaignId: identifiersType.campaignId,
          }),
        },
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        handler: userController.getUserProfileSharedForCampaign,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération du profil d’un utilisateur partagé (**userId**) pour la campagne donnée (**campaignId**)\n' +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'campaign'],
      },
    },
    {
      method: 'GET',
      path: '/api/users/{userId}/campaigns/{campaignId}/assessment-result',
      config: {
        validate: {
          params: Joi.object({
            userId: identifiersType.userId,
            campaignId: identifiersType.campaignId,
          }),
        },
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        handler: userController.getUserCampaignAssessmentResult,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération des résultats d’un parcours pour un utilisateur (**userId**) et pour la campagne d’évaluation donnée (**campaignId**)\n' +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'campaign'],
      },
    },
    {
      method: 'GET',
      path: '/api/users/{userId}/campaigns/{campaignId}/campaign-participations',
      config: {
        validate: {
          params: Joi.object({
            userId: identifiersType.userId,
            campaignId: identifiersType.campaignId,
          }),
        },
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        handler: userController.getUserCampaignParticipationToCampaign,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération de la dernière participation d’un utilisateur (**userId**) à une campagne donnée (**campaignId**)\n' +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'campaign', 'campaign-participations'],
      },
    },
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
