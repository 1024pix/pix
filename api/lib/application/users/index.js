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
      config: { handler: UserController.save, tags: ['api'] }
    },
    {
      method: 'GET',
      path: '/api/users/me',
      config: { handler: UserController.getAuthenticatedUserProfile, tags: ['api'] }
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
      method: 'PATCH',
      path: '/api/users/{id}',
      config: {
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
