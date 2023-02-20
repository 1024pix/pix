import Joi from 'joi';
import XRegExp from 'xregexp';
import securityPreHandlers from '../security-pre-handlers';
import userController from './user-controller';
import { sendJsonApiError, BadRequestError } from '../http-errors';
import userVerification from '../preHandlers/user-existence-verification';
import { account } from '../../config';

const { passwordValidationPattern: passwordValidationPattern } = account;

import { EntityValidationError } from '../../domain/errors';
import identifiersType from '../../domain/types/identifiers-type';
import OidcIdentityProviders from '../../domain/constants/oidc-identity-providers';

export const register = async function (server) {
  const adminRoutes = [
    {
      method: 'GET',
      path: '/api/admin/users',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleCertif,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
                securityPreHandlers.checkAdminMemberHasRoleMetier,
              ])(request, h),
          },
        ],
        handler: userController.findPaginatedFilteredUsers,
        notes: [
          "- **Cette route est restreinte aux utilisateurs authentifiés ayant les droits d'accès**\n" +
            '- Elle permet de récupérer & chercher une liste d’utilisateurs\n' +
            '- Cette liste est paginée et filtrée selon un **firstName**, un **lastName**, un **email** et **identifiant** donnés',
        ],
        tags: ['api', 'admin', 'user'],
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
                securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
                securityPreHandlers.checkAdminMemberHasRoleSupport,
              ])(request, h),
          },
        ],
        handler: userController.unblockUserAccount,
        notes: ["- Permet à un administrateur de débloquer le compte d'un utilisateur"],
        tags: ['api', 'admin', 'user', 'unblock'],
      },
    },
    {
      method: 'POST',
      path: '/api/admin/users/{id}/add-pix-authentication-method',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
                'identity-provider': Joi.string()
                  .valid('GAR', OidcIdentityProviders.POLE_EMPLOI.service.code)
                  .required(),
              },
            },
          }),
        },
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
                type: Joi.string()
                  .valid(
                    'GAR',
                    'EMAIL',
                    'USERNAME',
                    OidcIdentityProviders.POLE_EMPLOI.service.code,
                    OidcIdentityProviders.CNAV.service.code
                  )
                  .required(),
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

    {
      method: 'PATCH',
      path: '/api/admin/users/{id}',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
      method: 'GET',
      path: '/api/admin/users/{id}/profile',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
        handler: userController.getProfileForAdmin,
        notes: [
          "- Permet à un administrateur de récupérer le nombre total de Pix d'un utilisateur\n et de ses scorecards",
        ],
        tags: ['api', 'user', 'profile'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/users/{id}/participations',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
        handler: userController.findCampaignParticipationsForUserManagement,
        notes: ["- Permet à un administrateur de lister les participations d'un utilisateur à une campagne"],
        tags: ['api', 'user', 'campaign-participations'],
      },
    },
    {
      method: 'GET',
      path: '/api/admin/users/{id}/organizations',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
              securityPreHandlers.adminMemberHasAtLeastOneAccessOf([
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
  ];

  server.route([
    ...adminRoutes,
    {
      method: 'POST',
      path: '/api/users',
      config: {
        auth: false,
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string(),
              attributes: Joi.object().required(),
              relationships: Joi.object(),
            }).required(),
            meta: Joi.object(),
          }).required(),
          options: {
            allowUnknown: true,
          },
        },
        handler: userController.save,
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/users/me',
      config: {
        handler: userController.getCurrentUser,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération de l’utilisateur courant\n',
        ],
        tags: ['api', 'user'],
      },
    },
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
      method: 'POST',
      path: '/api/users/{id}/update-email',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        handler: userController.updateUserEmailWithValidation,
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              type: Joi.string().valid('email-verification-codes').required(),
              attributes: {
                code: Joi.string()
                  .regex(/^[1-9]{6}$/)
                  .required(),
              },
            },
          }),
          failAction: (request, h, error) => {
            return EntityValidationError.fromJoiErrors(error.details);
          },
        },
        notes: [
          "- Suite à une demande de changement d'adresse e-mail, met à jour cette dernière pour l'utilisateur identifié par son id.",
        ],
        tags: ['api', 'user', 'update-email'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/password-update',
      config: {
        auth: false,
        pre: [
          {
            method: userVerification.verifyById,
            assign: 'user',
          },
        ],
        handler: userController.updatePassword,
        validate: {
          options: {
            allowUnknown: true,
          },
          params: Joi.object({
            id: identifiersType.userId,
          }),
          payload: Joi.object({
            data: {
              attributes: {
                password: Joi.string().pattern(XRegExp(passwordValidationPattern)).required(),
              },
            },
          }),
        },
        notes: [
          "- Met à jour le mot de passe d'un utilisateur identifié par son id\n" +
            "- Une clé d'identification temporaire permet de vérifier l'identité du demandeur",
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/pix-terms-of-service-acceptance',
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
        handler: userController.acceptPixLastTermsOfService,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Sauvegarde le fait que l'utilisateur a accepté les dernières Conditions Générales d'Utilisation de Pix App\n" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
            "- Le contenu de la requête n'est pas pris en compte.",
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/pix-orga-terms-of-service-acceptance',
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
        handler: userController.acceptPixOrgaTermsOfService,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Sauvegarde le fait que l'utilisateur a accepté les Conditions Générales d'Utilisation de Pix Orga\n" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
            "- Le contenu de la requête n'est pas pris en compte.",
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/lang/{lang}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
            lang: Joi.string().valid('fr', 'en'),
          }),
        },
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        handler: userController.changeLang,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Modifie la langue de l'utilisateur\n" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
            '- La lang contient les deux lettres de la langue choisie.',
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/pix-certif-terms-of-service-acceptance',
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
        handler: userController.acceptPixCertifTermsOfService,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Sauvegarde le fait que l'utilisateur a accepté les Conditions Générales d'Utilisation de Pix Certif\n" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
            "- Le contenu de la requête n'est pas pris en compte.",
        ],
        tags: ['api', 'user'],
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
      path: '/api/users/{id}/has-seen-new-dashboard-info',
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
        handler: userController.rememberUserHasSeenNewDashboardInfo,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Sauvegarde le fait que l'utilisateur ait vu le message sur le nouveau dashboard" +
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
      method: 'GET',
      path: '/api/users/{id}/is-certifiable',
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
        handler: userController.isCertifiable,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération du nombre total de Pix de l'utilisateur\n" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'GET',
      path: '/api/users/{id}/profile',
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
        handler: userController.getProfile,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Récupération du nombre total de Pix de l'utilisateur\n et de ses scorecards" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'profile'],
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
      method: 'PUT',
      path: '/api/users/{id}/email/verification-code',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
          payload: Joi.object({
            data: {
              type: Joi.string().valid('email-verification-codes').required(),
              attributes: {
                'new-email': Joi.string().email().required(),
                password: Joi.string().required(),
              },
            },
          }),
          failAction: (request, h, error) => {
            return EntityValidationError.fromJoiErrors(error.details);
          },
        },
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        handler: userController.sendVerificationCode,
        notes: [
          '- Permet à un utilisateur de recevoir un code de vérification pour la validation de son adresse mail.',
        ],
        tags: ['api', 'user', 'verification-code'],
      },
    },
    {
      method: 'GET',
      path: '/api/users/{id}/authentication-methods',
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
        handler: userController.getUserAuthenticationMethods,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Elle permet la récupération des noms des méthodes de connexion de l'utilisateur.",
        ],
        tags: ['api', 'user', 'authentication-methods'],
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
      path: '/api/users/{id}/has-seen-last-data-protection-policy-information',
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
        handler: userController.rememberUserHasSeenLastDataProtectionPolicyInformation,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Sauvegarde le fait que l'utilisateur ait vu la nouvelle politique de confidentialité Pix" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user'],
      },
    },
  ]);
};

export const name = 'users-api';
