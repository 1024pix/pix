const Joi = require('joi');
const XRegExp = require('xregexp');

const securityPreHandlers = require('../security-pre-handlers');
const userController = require('./user-controller');
const { sendJsonApiError, BadRequestError } = require('../http-errors');
const userVerification = require('../preHandlers/user-existence-verification');
const { passwordValidationPattern } = require('../../config').account;
const featureToggles = require('../preHandlers/feature-toggles');
const { EntityValidationError } = require('../../domain/errors');
const identifiersType = require('../../domain/types/identifiers-type');

exports.register = async function(server) {
  server.route([
    {
      method: 'POST',
      path: '/api/users',
      config: {
        auth: false,
        handler: userController.save,
        tags: ['api'],
      },
    },
    {
      method: 'GET',
      path: '/api/users',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: userController.findPaginatedFilteredUsers,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de récupérer & chercher une liste d’utilisateurs\n' +
          '- Cette liste est paginée et filtrée selon un **firstName**, un **lastName** et/ou un **email** donnés',
        ],
        tags: ['api', 'user'],
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
      path: '/api/admin/users/{id}',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
          failAction: (request, h) => {
            return sendJsonApiError(new BadRequestError('L\'identifiant de l\'utilisateur n\'est pas au bon format.'), h);
          },
        },
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: userController.getUserDetailsForAdmin,
        notes: [
          '- **Cette route est restreinte aux utilisateurs administrateurs**\n' +
          '- Elle permet de récupérer le détail d\'un utilisateur dans un contexte d\'administration\n',
        ],
        tags: ['api', 'administration', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/users/{id}',
      config: {
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
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
              },
            },
          }),
          options: {
            allowUnknown: true,
          },
        },
        handler: userController.updateUserDetailsForAdministration,
        notes: [
          '- Permet à un administrateur de mettre à jour certains attributs d\'un utilisateur identifié par son identifiant',
        ],
        tags: ['api', 'administration', 'user'],
      },
    },
    {
      method: 'GET',
      path: '/api/users/{id}/memberships',
      config: {
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.getMemberships,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des accès utilisateurs à partir de l’id\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'membership'],
      },
    },
    {
      method: 'GET',
      path: '/api/users/{id}/certification-center-memberships',
      config: {
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.getCertificationCenterMemberships,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des accès utilisateurs pour les centres de certifs à partir de l’id\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'certification-membership'],
      },
    },
    {
      method: 'GET',
      path: '/api/users/{id}/campaign-participations',
      config: {
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
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
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
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
          '- Cette liste est paginée et filtrée selon des **states** qui peuvent avoir comme valeurs: ONGOING, TO_SHARE et ENDED',
        ],
        tags: ['api'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/email',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
          {
            method: featureToggles.isMyAccountEnabled,
            assign: 'isMyAccountEnabled',
          },
        ],
        handler: userController.updateEmail,
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
          options: {
            allowUnknown: true,
          },
          payload: Joi.object({
            data: {
              type: Joi.string().valid('users').required(),
              attributes: {
                email: Joi.string().email().required(),
              },
            },
          }),
          failAction: (request, h, error) => {
            return EntityValidationError.fromJoiErrors(error.details);
          },
        },
        notes: [
          '- Met à jour l\'email d\'un utilisateur identifié par son id',
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/password-update',
      config: {
        auth: false,
        pre: [{
          method: userVerification.verifyById,
          assign: 'user',
        }],
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
          '- Met à jour le mot de passe d\'un utilisateur identifié par son id\n' +
          '- Une clé d\'identification temporaire permet de vérifier l\'identité du demandeur',
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/pix-terms-of-service-acceptance',
      config: {
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.accepPixLastTermsOfService,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Sauvegarde le fait que l\'utilisateur a accepté les dernières Conditions Générales d\'Utilisation de Pix App\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
          '- Le contenu de la requête n\'est pas pris en compte.',
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/pix-orga-terms-of-service-acceptance',
      config: {
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.acceptPixOrgaTermsOfService,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Sauvegarde le fait que l\'utilisateur a accepté les Conditions Générales d\'Utilisation de Pix Orga\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
          '- Le contenu de la requête n\'est pas pris en compte.',
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
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        handler: userController.changeLang,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Modifie la langue de l\'utilisateur\n' +
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
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.acceptPixCertifTermsOfService,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Sauvegarde le fait que l\'utilisateur a accepté les Conditions Générales d\'Utilisation de Pix Certif\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
          '- Le contenu de la requête n\'est pas pris en compte.',
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/remember-user-has-seen-assessment-instructions',
      config: {
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.rememberUserHasSeenAssessmentInstructions,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Sauvegarde le fait que l\'utilisateur ait vu le didacticiel' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
          '- Le contenu de la requête n\'est pas pris en compte.',
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/has-seen-new-level-info',
      config: {
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.rememberUserHasSeenNewLevelInfo,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Sauvegarde le fait que l\'utilisateur ait vu le message sur le nouveau niveau' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
          '- Le contenu de la requête n\'est pas pris en compte.',
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/has-seen-new-dashboard-info',
      config: {
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.rememberUserHasSeenNewDashboardInfo,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Sauvegarde le fait que l\'utilisateur ait vu le message sur le nouveau dashboard' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
          '- Le contenu de la requête n\'est pas pris en compte.',
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'GET',
      path: '/api/users/{id}/is-certifiable',
      config: {
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.isCertifiable,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération du nombre total de Pix de l\'utilisateur\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'GET',
      path: '/api/users/{id}/profile',
      config: {
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.getProfile,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération du nombre total de Pix de l\'utilisateur\n et de ses scorecards' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'profile'],
      },
    },
    {
      method: 'POST',
      path: '/api/users/{userId}/competences/{competenceId}/reset',
      config: {
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        validate: {
          params: Joi.object({
            userId: identifiersType.userId,
            competenceId: identifiersType.competenceId,
          }),
        },
        handler: userController.resetScorecard,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Cette route réinitilise le niveau d\'un utilisateur donné (**userId**) pour une compétence donnée (**competenceId**)',
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
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
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
      path: '/api/users/{userId}/campaigns/{campaignId}/campaign-participations',
      config: {
        validate: {
          params: Joi.object({
            userId: identifiersType.userId,
            campaignId: identifiersType.campaignId,
          }),
        },
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        handler: userController.getUserCampaignParticipationToCampaign,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des participations d’un utilisateur (**userId**) à la campagne donnée (**campaignId**)\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'campaign', 'campaign-participations'],
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
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: userController.anonymizeUser,
        notes: [
          '- Permet à un administrateur d\'anonymiser un utilisateur',
        ],
        tags: ['api', 'administration', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/users/{id}/dissociate',
      config: {
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: userController.dissociateSchoolingRegistrations,
        notes: [
          '- Permet à un administrateur de dissocier un utilisateur\n' +
          'des inscriptions scolaires qui lui sont rattachées.',
        ],
        tags: ['api', 'administration', 'user'],
      },
    },
    {
      method: 'POST',
      path: '/api/users/pole-emploi',
      config: {
        auth: false,
        handler: userController.createPoleEmploiUser,
        tags: ['api'],
      },
    },
  ]);
};

exports.name = 'users-api';
