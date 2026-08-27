import { config } from '../../../../src/shared/config.js';
import { temporaryStorage } from '../../../../src/shared/infrastructure/key-value-storages/index.js';
import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';
import { SessionIdIsRequiredError, UserIdIsRequiredError } from '../../domain/errors.js';
import { RevokeUntilMustBeAnInstanceOfDate } from '../../domain/errors.js';
import { RevokedUserAccess } from '../../domain/models/RevokedUserAccess.js';

const revokedUserAccessTemporaryStorage = temporaryStorage.withPrefix('revoked-user-access:');
const revokedUserAccessLifespanMs = config.authentication.revokedUserAccessLifespanMs;

const isSessionLogoutEnabled = featureToggles.use('isSessionLogoutEnabled');

/**
 * Saves the revoke date for all the accesses of a user.
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

  await revokedUserAccessTemporaryStorage.save({
    key: `${userId}:all`,
    value: Math.floor(revokeUntil.getTime() / 1000),
    expirationDelaySeconds: revokedUserAccessLifespanMs / 1000,
  });
}

/**
 * Saves the revoke date for a user session.
 *
 * @param {Object} params - The params object.
 * @param {string} params.userId - The ID of the user to revoke access for.
 * @param {string} params.sessionId - The ID of the user’s session to revoke.
 * @param {Date} params.revokeUntil - The date until the user's access should be revoked.
 */
async function revokeSession({ userId, sessionId, revokeUntil }) {
  if (!userId) {
    throw new UserIdIsRequiredError();
  }

  if (!sessionId) {
    throw new SessionIdIsRequiredError();
  }

  if (!(revokeUntil instanceof Date)) {
    throw new RevokeUntilMustBeAnInstanceOfDate();
  }

  await revokedUserAccessTemporaryStorage.save({
    key: `${userId}:${sessionId}`,
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
  if (!isSessionLogoutEnabled.value) {
    const revokeTimeStamp = await revokedUserAccessTemporaryStorage.get(userId);
    return new RevokedUserAccess({ revokeTimeStamp });
  }

  const revokeKeys = await revokedUserAccessTemporaryStorage.keys(`${userId}:*`);

  const revokeTimeStamps = Object.fromEntries(
    await Promise.all(
      revokeKeys.map(async (key) => [key.split(':')[1], await revokedUserAccessTemporaryStorage.get(key)]),
    ),
  );

  const { all: revokeTimeStamp, ...revokeSessions } = revokeTimeStamps;

  return new RevokedUserAccess({ revokeTimeStamp, revokeSessions });
}

export const revokedUserAccessRepository = { revokeAll, revokeSession, findByUserId };
