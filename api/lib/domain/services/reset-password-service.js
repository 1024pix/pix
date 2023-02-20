import jsonwebtoken from 'jsonwebtoken';
import settings from '../../config';
import passwordResetDemandRepository from '../../infrastructure/repositories/reset-password-demands-repository';
import crypto from 'crypto';

export default {
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
