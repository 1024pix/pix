import crypto from 'node:crypto';

import jsonwebtoken from 'jsonwebtoken';

import * as passwordResetDemandRepository from '../../../src/identity-access-management/infrastructure/repositories/reset-password-demand.repository.js';
import { config } from '../../config.js';

const generateTemporaryKey = function () {
  return jsonwebtoken.sign(
    {
      data: crypto.randomBytes(16).toString('base64'),
    },
    config.temporaryKey.secret,
    { expiresIn: config.temporaryKey.tokenLifespan },
  );
};

const invalidateOldResetPasswordDemand = function (
  userEmail,
  resetPasswordDemandRepository = passwordResetDemandRepository,
) {
  return resetPasswordDemandRepository.markAsBeingUsed(userEmail);
};

const verifyDemand = function (temporaryKey, resetPasswordDemandRepository = passwordResetDemandRepository) {
  return resetPasswordDemandRepository.findByTemporaryKey(temporaryKey).then((fetchedDemand) => fetchedDemand.toJSON());
};

const hasUserAPasswordResetDemandInProgress = function (
  email,
  temporaryKey,
  resetPasswordDemandRepository = passwordResetDemandRepository,
) {
  return resetPasswordDemandRepository.findByUserEmail(email, temporaryKey);
};

export { generateTemporaryKey, hasUserAPasswordResetDemandInProgress, invalidateOldResetPasswordDemand, verifyDemand };
