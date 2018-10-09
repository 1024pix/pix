const securityController = require('../../interfaces/controllers/security-controller');
const userController = require('./user-controller');
const Joi = require('joi');
const userVerification = require('../preHandlers/user-existence-verification');
const { passwordValidationPattern } = require('../../settings');
const XRegExp = require('xregexp');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/users',
      config: {
        auth: false,
        handler: userController.save,
        tags: ['api']
      }
    }, {
      method: 'GET',
      path: '/api/users',
      config: {
        pre: [{
          method: securityController.checkUserHasRolePixMaster,
          assign: 'hasRolePixMaster'
        }],
        handler: userController.find,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés avec le rôle Pix Master**\n' +
          '- Elle permet de récupérer & chercher une liste d’utilisateurs (avec pagination)'
        ],
        tags: ['api', 'user']
      }
    }, {
      method: 'GET',
      path: '/api/users/{id}',
      config: {
        handler: userController.getUser,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération de l‘utilisateur par id\n' +
          '- L‘id demandé doit correspondre à celui de l‘utilisateur authentifié',
        ],
        tags: ['api', 'user'],
      }
    },
    {
      method: 'GET',
      path: '/api/users/me',
      config: {
        handler: userController.getAuthenticatedUserProfile,
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/users/{id}/skills',
      config: {
        pre: [{
          method: userVerification.verifyById,
          assign: 'user'
        }],
        handler: userController.getProfileToCertify
        , tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/users/{id}/organization-accesses',
      config: {
        handler: userController.getOrganizationAccesses,
        notes : [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération des accès utilisateurs à partir de l\'id\n' +
          '- L‘id demandé doit correspondre à celui de l‘utilisateur authentifié',
        ],
        tags: ['api']
      }
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}',
      config: {
        auth: false,
        pre: [{
          method: userVerification.verifyById,
          assign: 'user'
        }],
        handler: userController.updateUser,
        validate: {
          options: {
            allowUnknown: true
          },
          payload: {
            data: {
              attributes: {
                password: Joi.string().regex(XRegExp(passwordValidationPattern)),
                'pix-orga-terms-of-service-accepted': Joi.boolean()
              }
            }
          }
        }, tags: ['api']
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'users-api',
  version: '1.0.0'
};
