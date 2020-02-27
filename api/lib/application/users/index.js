const securityController = require('../../interfaces/controllers/security-controller');
const userController = require('./user-controller');
const Joi = require('@hapi/joi');
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
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/users',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: userController.findPaginatedFilteredUsers,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de récupérer & chercher une liste d’utilisateurs\n' +
          '- Cette liste est paginée et filtrée selon un **firstName**, un **lastName** et/ou un **email** donnés'
        ],
        tags: ['api', 'user']
      }
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
      }
    },
    {
      method: 'GET',
      path: '/api/users/{id}/memberships',
      config: {
        pre: [{
          method: securityController.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser'
        }],
        handler: userController.getMemberships,
        notes : [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des accès utilisateurs à partir de l’id\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'membership']
      }
    },
    {
      method: 'GET',
      path: '/api/users/{id}/certification-center-memberships',
      config: {
        pre: [{
          method: securityController.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser'
        }],
        handler: userController.getCertificationCenterMemberships,
        notes : [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des accès utilisateurs pour les centres de certifs à partir de l’id\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'certification-membership']
      }
    },
    {
      method: 'GET',
      path: '/api/users/{id}/campaign-participations',
      config: {
        pre: [{
          method: securityController.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser'
        }],
        handler: userController.getCampaignParticipations,
        notes : [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des participations à des campagnes à partir de l’id\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié' +
          '- Les participations aux campagnes sont triées par ordre inverse de création' +
          '  (les plus récentes en premier)',
        ],
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/users/{id}/user-orga-settings',
      config: {
        pre: [{
          method: securityController.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser'
        }],
        handler: userController.getUserOrgaSettings,
        notes : [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des paramètres utilisateurs relatives à Pix Orga\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'userOrgaSettings']
      }
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/password-update',
      config: {
        auth: false,
        pre: [{
          method: userVerification.verifyById,
          assign: 'user'
        }],
        handler: userController.updatePassword,
        validate: {
          options: {
            allowUnknown: true
          },
          payload: Joi.object({
            data: {
              attributes: {
                password: Joi.string().pattern(XRegExp(passwordValidationPattern)).required(),
              }
            }
          })
        },
        notes : [
          '- Met à jour le mot de passe d\'un utilisateur identifié par son id\n' +
          '- Une clé d\'identification temporaire permet de vérifier l\'identité du demandeur'
        ],
        tags: ['api', 'user'],
      }
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/pix-orga-terms-of-service-acceptance',
      config: {
        pre: [{
          method: securityController.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser'
        }],
        handler: userController.acceptPixOrgaTermsOfService,
        notes : [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Sauvegarde le fait que l\'utilisateur a accepté les Conditions Générales d\'Utilisation de Pix Orga\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
          '- Le contenu de la requête n\'est pas pris en compte.',
        ],
        tags: ['api', 'user'],
      }
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/pix-certif-terms-of-service-acceptance',
      config: {
        pre: [{
          method: securityController.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser'
        }],
        handler: userController.acceptPixCertifTermsOfService,
        notes : [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Sauvegarde le fait que l\'utilisateur a accepté les Conditions Générales d\'Utilisation de Pix Certif\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
          '- Le contenu de la requête n\'est pas pris en compte.',
        ],
        tags: ['api', 'user'],
      }
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/remember-user-has-seen-assessment-instructions',
      config: {
        pre: [{
          method: securityController.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser'
        }],
        handler: userController.rememberUserHasSeenAssessmentInstructions,
        notes : [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Sauvegarde le fait que l\'utilisateur ait vu le didacticiel' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
          '- Le contenu de la requête n\'est pas pris en compte.',
        ],
        tags: ['api', 'user'],
      }
    },
    {
      method: 'GET',
      path: '/api/users/{id}/certification-profile',
      config: {
        pre: [{
          method: securityController.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser'
        }],
        handler: userController.getCertificationProfile,
        notes : [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération du nombre total de Pix de l\'utilisateur\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user']
      }
    },
    {
      method: 'GET',
      path: '/api/users/{id}/pixscore',
      config: {
        pre: [{
          method: securityController.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser'
        }],
        handler: userController.getPixScore,
        notes : [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération du nombre total de Pix de l\'utilisateur\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user']
      }
    },
    {
      method: 'GET',
      path: '/api/users/{id}/scorecards',
      config: {
        pre: [{
          method: securityController.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser'
        }],
        handler: userController.getScorecards,
        notes : [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des niveaux par compétences de l\'utilisateur\n' +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'scorecard']
      }
    },
    {
      method: 'POST',
      path: '/api/users/{userId}/competences/{competenceId}/reset',
      config: {
        pre: [{
          method: securityController.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser'
        }],
        handler: userController.resetScorecard,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Cette route réinitilise le niveau d\'un utilisateur donné (**userId**) pour une compétence donnée (**competenceId**)',
          '- Cette route retourne les nouvelles informations de niveau de la compétence',
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'scorecard']
      }
    },
  ]);
};

exports.name = 'users-api';
