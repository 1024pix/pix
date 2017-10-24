const userService = require('../../domain/services/user-service');
const mailService = require('../../domain/services/mail-service');
const resetPasswordService = require('../../domain/services/reset-password-service');
const tokenService = require('../../domain/services/token-service');
const passwordResetSerializer = require('../../infrastructure/serializers/jsonapi/password-reset-serializer');
const resetPasswordDemandRepository = require('../../infrastructure/repositories/reset-password-demands-repository');
const userRepository = require('../../infrastructure/repositories/user-repository');
const { UserNotFoundError, InternalError, PasswordResetDemandNotFoundError, InvalidTemporaryKeyError } = require('../../domain/errors');
const errorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');

function _sendPasswordResetDemandUrlEmail(request, email, temporaryKey, passwordResetDemand) {
  const passwordResetDemandUrl = `http://${request.headers.host}`;
  return mailService
    .sendResetPasswordDemandEmail(email, passwordResetDemandUrl, temporaryKey)
    .then(() => passwordResetDemand);
}

module.exports = {
  createResetDemand(request, reply) {

    const { email } = request.payload.data.attributes;

    return userService.isUserExisting(email)
      .then(() => resetPasswordService.invalidOldResetPasswordDemand(email))
      .then(resetPasswordService.generateTemporaryKey)
      .then((temporaryKey) => {
        return resetPasswordDemandRepository.create({ email, temporaryKey })
          .then((passwordResetDemand) => _sendPasswordResetDemandUrlEmail(request, email, temporaryKey, passwordResetDemand))
          .then((passwordResetDemand) => passwordResetSerializer.serialize(passwordResetDemand.attributes))
          .then((serializedPayload) => reply(serializedPayload).code(201));
      })
      .catch((err) => {
        if (err instanceof UserNotFoundError) {
          return reply(errorSerializer.serialize(err.getErrorMessage())).code(404);
        }

        return reply(errorSerializer.serialize(new InternalError().getErrorMessage())).code(500);
      });
  },

  checkResetDemand(request, reply) {
    const temporaryKey = request.params.temporaryKey;

    return tokenService.verifyValidity(temporaryKey)
      .then(() => resetPasswordService.verifyDemand(temporaryKey))
      .then((passwordResetDemand) => userRepository.findByEmail(passwordResetDemand.email))
      .then((user) => userSerializer.serialize(user))
      .then(reply)
      .catch((err) => {
        if (err instanceof InvalidTemporaryKeyError) {
          return reply(errorSerializer.serialize(err.getErrorMessage())).code(401);
        }
        if (err instanceof PasswordResetDemandNotFoundError) {
          return reply(errorSerializer.serialize(err.getErrorMessage())).code(404);
        }
        return reply(errorSerializer.serialize(new InternalError().getErrorMessage())).code(500);
      });
  }
};

