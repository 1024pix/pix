const jsonwebtoken = require('jsonwebtoken');
const settings = require('../../settings');
const resetPasswordDemandRepository = require('../../infrastructure/repositories/reset-password-demands-repository');

module.exports = {
  generateTemporaryKey() {
    return jsonwebtoken.sign({
      data: settings.temporaryKey.payload
    }, settings.temporaryKey.secret, { expiresIn: settings.temporaryKey.tokenLifespan });
  },

  invalidOldResetPasswordDemand(userEmail) {
    return resetPasswordDemandRepository.markAsBeingUsed(userEmail);
  }
};
