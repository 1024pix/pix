const jsonwebtoken = require('jsonwebtoken');
const settings = require('../../settings');
const passwordResetDemandRepository = require('../../infrastructure/repositories/password-reset-demand-repository');
const { InvalidTemporaryKeyError } = require('../errors');

module.exports = {
  generateTemporaryKey(userId) {
    return jsonwebtoken.sign(
      { userId },
      settings.temporaryKey.secret,
      { expiresIn: settings.temporaryKey.tokenLifespan }
    );
  },

  extractUserIdFromTemporaryKey(temporaryKey) {
    return passwordResetDemandRepository
      .findByTemporaryKey(temporaryKey)
      .then((passwordResetDemandData) => passwordResetDemandData.toJSON())
      .then((passwordResetDemand) => {
        if (passwordResetDemand.used) {
          throw new InvalidTemporaryKeyError();
        }

        try {
          const decoded = jsonwebtoken.verify(passwordResetDemand.temporaryKey, settings.temporaryKey.secret);

          return decoded.userId;
        }
        catch (error) {
          throw new InvalidTemporaryKeyError();
        }
      });
  },
};
