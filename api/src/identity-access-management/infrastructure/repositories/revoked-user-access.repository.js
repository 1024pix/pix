import { config } from '../../../../src/shared/config.js';
import { temporaryStorage } from '../../../../src/shared/infrastructure/key-value-storages/index.js';
import { UserIdIsRequiredError } from '../../domain/errors.js';
import { RevokeUntilMustBeAnInstanceOfDate } from '../../domain/errors.js';
import { RevokedUserAccess } from '../../domain/models/RevokedUserAccess.js';

const revokedUserAccessTemporaryStorage = temporaryStorage.withPrefix('revoked-user-access:');
const revokedUserAccessLifespanMs = config.authentication.revokedUserAccessLifespanMs;

/**
 * Saves the revoke date for a user in the temporary storage.
 *
 * @param {Object} params - The params object.
 * @param {string} params.userId - The ID of the user to revoke access for.
 * @param {Date} params.revokeUntil - The date until the user's access should be revoked.
 */
async function revokeAll({ userId, revokeUntil }) {
  if (!userId) {
    throw new UserIdIsRequiredError();
  }

  if (!(revokeUntil instanceof Date)) {
    throw new RevokeUntilMustBeAnInstanceOfDate();
  }

  await revokedUserAccessTemporaryStorage.save({
    key: userId,
    value: Math.floor(revokeUntil.getTime() / 1000),
    expirationDelaySeconds: revokedUserAccessLifespanMs / 1000,
  });
}

/**
 * Retrieves the revoked access for a user from the temporary storage.
 *
 * @param {string} userId - The ID of the user to retrieve the revocation date for.
 * @returns {Promise<RevokedUserAccess>} - The revoked user access object.
 */
async function findByUserId(userId) {
  const value = await revokedUserAccessTemporaryStorage.get(userId);
  return new RevokedUserAccess(value);
}

export const revokedUserAccessRepository = { revokeAll, findByUserId };
