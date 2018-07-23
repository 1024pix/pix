const Boom = require('boom');
const moment = require('moment');
const JSONAPIError = require('jsonapi-serializer').Error;

const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');
const validationErrorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const mailService = require('../../domain/services/mail-service');
const userService = require('../../domain/services/user-service');
const userRepository = require('../../../lib/infrastructure/repositories/user-repository');
const profileService = require('../../domain/services/profile-service');
const profileSerializer = require('../../infrastructure/serializers/jsonapi/profile-serializer');
const passwordResetDemandService = require('../../domain/services/reset-password-service');
const encryptionService = require('../../domain/services/encryption-service');
const tokenService = require('../../domain/services/token-service');

const usecases = require('../../domain/usecases');
const JSONAPI = require('../../interfaces/jsonapi');
const reCaptchaValidator = require('../../infrastructure/validators/grecaptcha-validator');

const Bookshelf = require('../../infrastructure/bookshelf');

const logger = require('../../infrastructure/logger');
const {
  InvalidTokenError,
  EntityValidationError,
  PasswordResetDemandNotFoundError,
  UserNotAuthorizedToAccessEntity,
} = require('../../domain/errors');

module.exports = {

  save(request, reply) {

    const reCaptchaToken = request.payload.data.attributes['recaptcha-token'];
    const user = userSerializer.deserialize(request.payload);

    return usecases.createUser({
      user,
      reCaptchaToken,
      userRepository,
      reCaptchaValidator,
      encryptionService,
      mailService,
    })
      .then((savedUser) => {
        reply(userSerializer.serialize(savedUser)).code(201);
      })
      .catch((error) => {

        if (error instanceof EntityValidationError) {
          return reply(JSONAPI.unprocessableEntityError(error.invalidAttributes)).code(422);
        }

        logger.error(error);
        return reply(JSONAPI.internalError('Une erreur est survenue lors de la création de l’utilisateur')).code(500);
      });
  },

  getUser(request, reply) {
    const requestedUserId = parseInt(request.params.id, 10);
    const authenticatedUserId = request.auth.credentials.userId;

    return usecases.getUser({ authenticatedUserId, requestedUserId, userRepository })
      .then((foundUser) => {
        return reply(userSerializer.serialize(foundUser)).code(200);
      })
      .catch((err) => {

        if (err instanceof UserNotAuthorizedToAccessEntity) {
          const jsonAPIError = new JSONAPIError({
            code: '403',
            title: 'Forbidden Access',
            detail: 'Vous n’avez pas accès à cet utilisateur',
          });
          return reply(jsonAPIError).code(403);
        }

        logger.error(err);
        return reply(JSONAPI.internalError('Une erreur est survenue lors de la récupération de l’utilisateur')).code(500);
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
        return reply(JSONAPI.internalError('Une erreur interne est survenue.')).code(500);
      });
  },

  getProfileToCertify(request, reply) {
    const userId = request.params.id;
    const currentDate = moment().toISOString();

    return userService.getProfileToCertify(userId, currentDate)
      .then(reply)
      .catch(err => {
        logger.error(err);
        reply(Boom.badImplementation(err));
      });
  },
};

// TODO refacto, extract and simplify
const _replyErrorWithMessage = function(reply, errorMessage, statusCode) {
  reply(validationErrorSerializer.serialize(_handleWhenInvalidAuthorization(errorMessage))).code(statusCode);
};

function _handleWhenInvalidAuthorization(errorMessage) {
  return {
    data: {
      authorization: [errorMessage],
    },
  };
}
