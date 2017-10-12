const jsonwebtoken = require('jsonwebtoken');
const settings = require('../../settings');
const Bookshelf = require('../../infrastructure/bookshelf');
const passwordResetDemandRepository = require('../../infrastructure/repositories/reset-password-demands-repository');
const { PasswordResetDemandNotFoundError } = require('../../domain/errors');

module.exports = {
  generateTemporaryKey() {
    return jsonwebtoken.sign({
      data: settings.temporaryKey.payload
    }, settings.temporaryKey.secret, { expiresIn: settings.temporaryKey.tokenLifespan });
  },

  invalidOldResetPasswordDemand(userEmail) {
    return passwordResetDemandRepository.markAsBeingUsed(userEmail);
  },

  verifyDemand(temporaryKey) {
    return passwordResetDemandRepository
      .findByTemporaryKey(temporaryKey)
      .then((fetchedDemand) => fetchedDemand.toJSON());
  },

  hasUserAPasswordResetDemandInProgress(email) {
    return passwordResetDemandRepository.findByUserEmail(email)
      .catch((err) => {
        if (err instanceof Bookshelf.Model.NotFoundError) {
          throw new PasswordResetDemandNotFoundError();
        }
      });
  }
};
