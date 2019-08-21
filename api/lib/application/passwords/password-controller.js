const settings = require('../../settings');

const userService = require('../../domain/services/user-service');
const mailService = require('../../domain/services/mail-service');
const resetPasswordService = require('../../domain/services/reset-password-service');
const tokenService = require('../../domain/services/token-service');

const passwordResetSerializer = require('../../infrastructure/serializers/jsonapi/password-reset-serializer');
const userSerializer = require('../../infrastructure/serializers/jsonapi/user-serializer');
const resetPasswordDemandRepository = require('../../infrastructure/repositories/reset-password-demands-repository');
const userRepository = require('../../infrastructure/repositories/user-repository');

function _sendPasswordResetDemandUrlEmail(email, temporaryKey) {

  const passwordResetDemandUrl = `http://${settings.app.domain}`;
  return mailService
    .sendResetPasswordDemandEmail(email, passwordResetDemandUrl, temporaryKey);
}

module.exports = {
  createResetDemand(request, h) {

    const user = userSerializer.deserialize(request.payload);

    let temporaryKey, passwordResetDemand;

    return userRepository.isUserExistingByEmail(user.email)
      .then(resetPasswordService.generateTemporaryKey)
      .then((key) => {
        temporaryKey = key;
        return resetPasswordDemandRepository.create({ email: user.email, temporaryKey });
      })
      .then((demand) => {
        passwordResetDemand = demand;
        _sendPasswordResetDemandUrlEmail(user.email, temporaryKey);
      })
      .then(() => passwordResetSerializer.serialize(passwordResetDemand.attributes))
      .then((serializedPayload) => h.response(serializedPayload).created());
  },

  checkResetDemand(request) {
    const temporaryKey = request.params.temporaryKey;

    return tokenService.verifyValidity(temporaryKey)
      .then(() => resetPasswordService.verifyDemand(temporaryKey))
      .then((passwordResetDemand) => userRepository.findByEmail(passwordResetDemand.email))
      .then((user) => userSerializer.serialize(user));
  }
};
