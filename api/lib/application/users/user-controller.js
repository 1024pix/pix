const Boom = require('boom');
const moment = require('moment');
const _ = require('../../infrastructure/utils/lodash-utils');

const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const mailService = require('../../domain/services/mail-service');
const userService = require('../../domain/services/user-service');
const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const profileService = require('../../domain/services/profile-service');
const profileSerializer = require('../../infrastructure/serializers/jsonapi/profile-serializer');
const googleReCaptcha = require('../../../lib/infrastructure/validators/grecaptcha-validator');
const { InvalidRecaptchaTokenError } = require('../../../lib/infrastructure/validators/errors');
const bookshelfUtils = require('../../infrastructure/utils/bookshelf-utils');
const passwordResetDemandService = require('../../domain/services/reset-password-service');
const encryptionService = require('../../domain/services/encryption-service');
const tokenService = require('../../domain/services/token-service');

const Bookshelf = require('../../infrastructure/bookshelf');

const logger = require('../../infrastructure/logger');
const { PasswordResetDemandNotFoundError, InternalError, InvalidTokenError } = require('../../domain/errors');
const { ValidationError: BookshelfValidationError } = require('bookshelf-validate/lib/errors');

function _isRequestWronglyFormatted(request) {
  return !_.has(request, 'payload') || !_.has(request, 'payload.data.attributes');
}

module.exports = {

  save(request, reply) {

    if (_isRequestWronglyFormatted(request)) {
      // FIXME: Should return a promise to be consistent
      return reply(Boom.badRequest());
    }

    const user = userSerializer.deserialize(request.payload);
    const recaptchaToken = request.payload.data.attributes['recaptcha-token'];

    return googleReCaptcha.verify(recaptchaToken)
      .then(() => userRepository.save(user))
      .then((savedUser) => {
        mailService.sendAccountCreationEmail(savedUser.email);
        reply(userSerializer.serialize(savedUser)).code(201);
      }).catch((err) => {

        if (err instanceof BookshelfValidationError) {
          return reply(validationErrorSerializer.serialize(err)).code(422);
        }

        if (err instanceof InvalidRecaptchaTokenError) {
          const userValidationErrors =  userRepository.validateData(user);
          err = _addUserErrorsWhenRecaptchaTokenInvalid(userValidationErrors);

          return reply(validationErrorSerializer.serialize(err)).code(422);
        }

        if (bookshelfUtils.isUniqConstraintViolated(err)) {
          err = _buildErrorWhenUniquEmail();
          return reply(validationErrorSerializer.serialize(err)).code(422);
        }

        logger.error(err);
        return reply(Boom.badImplementation(err));
      });
  },

  // FIXME: Pas de tests ?!
  getAuthenticatedUserProfile(request, reply) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);
    return userRepository.findUserById(userId)
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

        if (err instanceof Bookshelf.Model.NotFoundError) {
          return _replyErrorWithMessage(reply, 'Cet utilisateur est introuvable', 404);
        }

        logger.error(err);

        return _replyErrorWithMessage(reply, 'Une erreur est survenue lors de l’authentification de l’utilisateur', 500);
      });
  },

  async updatePassword(request, reply) {
    const { password } = request.payload.data.attributes;
    const hashedPassword = await encryptionService.hashPassword(password);
    let user = await userRepository.findUserById(request.params.id);
    user = user.toJSON();

    return passwordResetDemandService
      .hasUserAPasswordResetDemandInProgress(user.email)
      .then(() => userRepository.updatePassword(user.id, hashedPassword))
      .then(() => passwordResetDemandService.invalidOldResetPasswordDemand(user.email))
      .then(() => reply().code(204))
      .catch((err) => {
        if (err instanceof PasswordResetDemandNotFoundError) {
          return reply(validationErrorSerializer.serialize(err.getErrorMessage())).code(404);
        }
        return reply(validationErrorSerializer.serialize(new InternalError().getErrorMessage())).code(500);
      });
  },

  getProfileToCertify(request, reply) {
    const userId = request.params.id;
    const currentDate =  moment().toISOString();

    return userService.getProfileToCertify(userId, currentDate)
      .then(reply)
      .catch(err => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  }
};

const _replyErrorWithMessage = function(reply, errorMessage, statusCode) {
  reply(validationErrorSerializer.serialize(_handleWhenInvalidAuthorization(errorMessage))).code(statusCode);
};

function _addUserErrorsWhenRecaptchaTokenInvalid(validationErrors) {
  const captchaError = { recaptchaToken: ['Merci de cocher la case ci-dessous :'] };
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

