const jsonwebtoken = require('jsonwebtoken');
const settings = require('../../config.js');
const passwordResetDemandRepository = require('../../infrastructure/repositories/reset-password-demands-repository.js');
const crypto = require('crypto');

module.exports = {
  generateTemporaryKey() {
    return jsonwebtoken.sign(
      {
        data: crypto.randomBytes(16).toString('base64'),
      },
      settings.temporaryKey.secret,
      { expiresIn: settings.temporaryKey.tokenLifespan }
    );
  },

  invalidateOldResetPasswordDemand(userEmail) {
    return passwordResetDemandRepository.markAsBeingUsed(userEmail);
  },

  verifyDemand(temporaryKey) {
    return passwordResetDemandRepository
      .findByTemporaryKey(temporaryKey)
      .then((fetchedDemand) => fetchedDemand.toJSON());
  },

  hasUserAPasswordResetDemandInProgress(email, temporaryKey) {
    return passwordResetDemandRepository.findByUserEmail(email, temporaryKey);
  },
};
