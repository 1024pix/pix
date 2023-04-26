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

  invalidateOldResetPasswordDemand(userEmail, resetPasswordDemandRepository = passwordResetDemandRepository) {
    return resetPasswordDemandRepository.markAsBeingUsed(userEmail);
  },

  verifyDemand(temporaryKey, resetPasswordDemandRepository = passwordResetDemandRepository) {
    return resetPasswordDemandRepository
      .findByTemporaryKey(temporaryKey)
      .then((fetchedDemand) => fetchedDemand.toJSON());
  },

  hasUserAPasswordResetDemandInProgress(
    email,
    temporaryKey,
    resetPasswordDemandRepository = passwordResetDemandRepository
  ) {
    return resetPasswordDemandRepository.findByUserEmail(email, temporaryKey);
  },
};
