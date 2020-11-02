const securityPreHandlers = require('../security-pre-handlers');
const userController = require('./user-controller');
const Joi = require('@hapi/joi');
const { sendJsonApiError, BadRequestError } = require('../http-errors');
const userVerification = require('../preHandlers/user-existence-verification');
const { passwordValidationPattern } = require('../../config').account;
const XRegExp = require('xregexp');

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
            id: Joi.number().integer().required(),
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
        tags: ['api', 'administration' , 'user'],
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
            id: Joi.number().integer().required(),
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
        notes : [
          '- Permet à un administrateur de mettre à jour certains attributs d\'un utilisateur identifié par son identifiant',
        ],
        tags: ['api', 'administration' , 'user'],
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
        handler: userController.getMemberships,
        notes : [
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
        handler: userController.getCertificationCenterMemberships,
        notes : [
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
        handler: userController.getCampaignParticipations,
        notes : [
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
          payload: Joi.object({
            data: {
              attributes: {
                password: Joi.string().pattern(XRegExp(passwordValidationPattern)).required(),
              },
            },
          }),
        },
        notes : [
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
        handler: userController.accepPixLastTermsOfService,
        notes : [
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
        handler: userController.acceptPixOrgaTermsOfService,
        notes : [
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
      path: '/api/users/{id}/pix-certif-terms-of-service-acceptance',
      config: {
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        handler: userController.acceptPixCertifTermsOfService,
        notes : [
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
        handler: userController.rememberUserHasSeenAssessmentInstructions,
        notes : [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Sauvegarde le fait que l\'utilisateur ait vu le didacticiel' +
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
        handler: userController.isCertifiable,
        notes : [
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
        handler: userController.getProfile,
        notes : [
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
            userId: Joi.number().required(),
            campaignId: Joi.number().required(),
          }),
        },
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        handler: userController.getUserProfileSharedForCampaign,
        notes : [
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
            userId: Joi.number().required(),
            campaignId: Joi.number().required(),
          }),
        },
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        handler: userController.getUserCampaignParticipationToCampaign,
        notes : [
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
            id: Joi.number().integer().positive().required(),
          }),
        },
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: userController.anonymizeUser,
        notes : [
          '- Permet à un administrateur d\'anonymiser un utilisateur',
        ],
        tags: ['api', 'administration' , 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/authentication-methods/saml',
      config: {
        pre: [{
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        }],
        validate: {
          options: {
            allowUnknown: false,
          },
          params: Joi.object({
            id: Joi.number().integer().positive().required(),
          }),
          payload: Joi.object({
            data: {
              id: Joi.number().integer().positive().required(),
              type: Joi.string().valid('external-users').required(),
              attributes: {
                'external-user-token': Joi.string().required(),
                'expected-user-id': Joi.number().positive().required(),
              },
            },
          }),
        },
        handler: userController.updateUserSamlId,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Elle ajoute la méthode d\'authentification GAR au compte grâce aux informations\n' +
          '- contenues dans l\'Id Token, si le compte authentifié correspond au compte attendu.',
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/admin/users/{id}/dissociate',
      config: {
        validate: {
          params: Joi.object({
            id: Joi.number().integer().positive().required(),
          }),
        },
        pre: [{
          method: securityPreHandlers.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster',
        }],
        handler: userController.dissociateSchoolingRegistrations,
        notes : [
          '- Permet à un administrateur de dissocier un utilisateur\n' +
          'des inscriptions scolaires qui lui sont rattachées.',
        ],
        tags: ['api', 'administration' , 'user'],
      },
    },
  ]);
};

exports.name = 'users-api';
