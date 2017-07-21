const Boom = require('boom');
const _ = require('../../infrastructure/utils/lodash-utils');
const authorizationToken = require('../../../lib/infrastructure/validators/jsonwebtoken-verify');

const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const mailService = require('../../domain/services/mail-service');
const UserRepository = require('../../../lib/infrastructure/repositories/user-repository');
const { InvalidTokenError } = require('../../../lib/domain/errors');
const User = require('../../../lib/domain/models/data/user');
const profileService = require('../../domain/services/profile-service');
const profileSerializer = require('../../infrastructure/serializers/jsonapi/profile-serializer');
const googleReCaptcha = require('../../../lib/infrastructure/validators/grecaptcha-validator');
const { InvalidRecaptchaTokenError } = require('../../../lib/infrastructure/validators/errors');

const logger = require('../../infrastructure/logger');

function _isUniqConstraintViolated(err) {
  const SQLITE_UNIQ_CONSTRAINT = 'SQLITE_CONSTRAINT';
  const PGSQL_UNIQ_CONSTRAINT = '23505';

  return (err.code === SQLITE_UNIQ_CONSTRAINT || err.code === PGSQL_UNIQ_CONSTRAINT);
}

const _replyErrorWithMessage = function(reply, errorMessage, statusCode) {
  reply(validationErrorSerializer.serialize(_handleWhenInvalidAuthorization(errorMessage))).code(statusCode);
};

module.exports = {

  save(request, reply) {

    if (!_.has(request, 'payload') || !_.has(request, 'payload.data.attributes')) {
      return reply(Boom.badRequest());
    }

    const user = userSerializer.deserialize(request.payload);
    const recaptchaToken = request.payload.data.attributes['recaptcha-token'];

    return googleReCaptcha.verify(recaptchaToken)
      .then(() => {
        return user.save();
      })
      .then((user) => {
        mailService.sendAccountCreationEmail(user.get('email'));
        reply(userSerializer.serialize(user)).code(201);
      }).catch((err) => {

        if (err instanceof InvalidRecaptchaTokenError) {
          const userValidationErrors = user.validationErrors();
          err = _buildErrorWhenRecaptchaTokenInvalid(userValidationErrors);
        }

        if (_isUniqConstraintViolated(err)) {
          err = _buildErrorWhenUniquEmail();
        }

        reply(validationErrorSerializer.serialize(err)).code(422);
      });
  },

  getAuthenticatedUserProfile(request, reply) {
    const token = request.headers.authorization;
    return authorizationToken
      .verify(token)
      .then(UserRepository.findUserById)
      .then((foundUser) => {
        return profileService.getByUserId(foundUser.id);
      })
      .then((buildedProfile) => {
        reply(profileSerializer.serialize(buildedProfile)).code(201);
      })
      .catch((err) => {

        if (err instanceof InvalidTokenError) {
          return _replyErrorWithMessage(reply, 'Le token n’est pas valide', 401);
        }

        if (err === User.NotFoundError) {
          return _replyErrorWithMessage(reply, 'Cet utilisateur est introuvable', 404);
        }

        logger.error(err);

        return _replyErrorWithMessage(reply, 'Une erreur est survenue lors de l’authentification de l’utilisateur', 500);
      });
  }

};

function _buildErrorWhenRecaptchaTokenInvalid(validationErrors) {
  const captchaError = { recaptchaToken: ['Vous devez cliquer ci-dessous.'] };
  const mergedErrors = Object.assign(captchaError, validationErrors);
  return {
    data: mergedErrors
  };
}

function _buildErrorWhenUniquEmail() {
  return {
    data: {
      email: ['Cette adresse electronique est déjà enregistrée.']
    }
  };
}

function _handleWhenInvalidAuthorization(errorMessage) {
  return {
    data: {
      authorization: [errorMessage]
    }
  };
}

