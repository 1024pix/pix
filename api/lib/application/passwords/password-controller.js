const settings = require('../../settings');

const userService = require('../../domain/services/user-service');
const mailService = require('../../domain/services/mail-service');
const resetPasswordService = require('../../domain/services/reset-password-service');
const tokenService = require('../../domain/services/token-service');

const passwordResetSerializer = require('../../infrastructure/serializers/jsonapi/password-reset-serializer');
const errorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');
const logger = require('../../infrastructure/logger');

const resetPasswordDemandRepository = require('../../infrastructure/repositories/reset-password-demands-repository');
const userRepository = require('../../infrastructure/repositories/user-repository');

const { UserNotFoundError, InternalError, PasswordResetDemandNotFoundError, InvalidTemporaryKeyError } = require('../../domain/errors');

function _sendPasswordResetDemandUrlEmail(email, temporaryKey, passwordResetDemand) {

  const passwordResetDemandUrl = `http://${settings.app.domain}`;
  return mailService
    .sendResetPasswordDemandEmail(email, passwordResetDemandUrl, temporaryKey)
    .then(() => passwordResetDemand);
}

module.exports = {
  createResetDemand(request, h) {

    const user = userSerializer.deserialize(request.payload);

    return userService.isUserExistingByEmail(user.email)
      .then(() => resetPasswordService.invalidOldResetPasswordDemand(user.email))
      .then(resetPasswordService.generateTemporaryKey)
      .then((temporaryKey) => {
        return resetPasswordDemandRepository.create({ email: user.email, temporaryKey })
          .then((passwordResetDemand) => _sendPasswordResetDemandUrlEmail(user.email, temporaryKey, passwordResetDemand))
          .then((passwordResetDemand) => passwordResetSerializer.serialize(passwordResetDemand.attributes))
          .then((serializedPayload) => h.response(serializedPayload).code(201));
      })
      .catch((err) => {
        if (err instanceof UserNotFoundError) {
          return h.response(errorSerializer.serialize(err.getErrorMessage())).code(404);
        }

        logger.error(err);
        return h.response(errorSerializer.serialize(new InternalError().getErrorMessage())).code(500);
      });
  },

  checkResetDemand(request, h) {
    const temporaryKey = request.params.temporaryKey;

    return tokenService.verifyValidity(temporaryKey)
      .then(() => resetPasswordService.verifyDemand(temporaryKey))
      .then((passwordResetDemand) => userRepository.findByEmail(passwordResetDemand.email))
      .then((user) => userSerializer.serialize(user))
      .catch((err) => {
        if (err instanceof InvalidTemporaryKeyError) {
          return h.response(errorSerializer.serialize(err.getErrorMessage())).code(401);
        } else if (err instanceof PasswordResetDemandNotFoundError) {
          return h.response(errorSerializer.serialize(err.getErrorMessage())).code(404);
        }

        logger.error(err);
        return h.response(errorSerializer.serialize(new InternalError().getErrorMessage())).code(500);
      });
  }
};

