import Joi from 'joi';

import { config } from '../../../../src/shared/config.js';
import { temporaryStorage } from '../../../../src/shared/infrastructure/key-value-storages/index.js';
import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';
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
  Joi.assert(userId, Joi.required());
  Joi.assert(revokeUntil, Joi.date().required());

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
  Joi.assert(userId, Joi.required());
  Joi.assert(sessionId, Joi.required());
  Joi.assert(revokeUntil, Joi.date().required());

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
    const revokedAllTimeStamp = await revokedUserAccessTemporaryStorage.get(userId);
    return new RevokedUserAccess({ revokedAllTimeStamp });
  }

  const revokeKeys = await revokedUserAccessTemporaryStorage.keys(`${userId}:*`);

  const revokedTimeStamps = Object.fromEntries(
    await Promise.all(
      revokeKeys.map(async (key) => [key.split(':')[1], await revokedUserAccessTemporaryStorage.get(key)]),
    ),
  );

  const { all: revokedAllTimeStamp, ...revokedSessionTimeStamps } = revokedTimeStamps;

  return new RevokedUserAccess({ revokedAllTimeStamp, revokedSessions: Object.keys(revokedSessionTimeStamps).sort() });
}

export const revokedUserAccessRepository = { revokeAll, revokeSession, findByUserId };
