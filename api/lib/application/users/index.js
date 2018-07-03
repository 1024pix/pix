const UserController = require('./user-controller');
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
        handler: UserController.save,
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/users/{id}',
      config: {
        handler: UserController.getUser,
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
        handler: UserController.getAuthenticatedUserProfile,
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
        handler: UserController.getProfileToCertify
        , tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/api/users/{id}/organization-accesses',
      config: {
        handler: UserController.getOrganizationAccesses,
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
        handler: UserController.updatePassword,
        validate: {
          options: {
            allowUnknown: true
          },
          payload: {
            data: {
              attributes: {
                password: Joi.string().regex(XRegExp(passwordValidationPattern)).required()
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
