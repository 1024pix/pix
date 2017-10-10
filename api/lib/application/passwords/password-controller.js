const userService = require('../../domain/services/user-service');
const mailService = require('../../domain/services/mail-service');
const resetPasswordService = require('../../domain/services/reset-password-service');
const passwordResetSerializer = require('../../infrastructure/serializers/jsonapi/password-reset-serializer');
const resetPasswordDemandRepository = require('../../infrastructure/repositories/reset-password-demands-repository');
const { UserNotFoundError, InternalError } = require('../../domain/errors');
const errorSerializer = require('../../infrastructure/serializers/jsonapi/validation-error-serializer');

function _sendPasswordResetDemandUrlEmail(request, email, temporaryKey, passwordResetDemand) {
  const passwordResetDemandUrl = `${request.connection.info.protocol}://${request.info.host}`;
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
          return reply(errorSerializer.serialize(UserNotFoundError.getErrorMessage())).code(404);
        }
        return reply(errorSerializer.serialize(InternalError.getErrorMessage())).code(500);
      });
  }
};

