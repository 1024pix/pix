import { config } from '../../../shared/config.js';

/**
 * @param {{
 *   userId: string,
 *   sessionId: string,
 *   revokedUserAccessRepository: typeof import('../../infrastructure/repositories/revoked-user-access.repository.js').revokedUserAccessRepository,
 * }} params
 */
export async function revokeSession({ userId, sessionId, revokedUserAccessRepository }) {
  const revokeUntil = new Date(Date.now() + config.authentication.revokedUserAccessLifespanMs);

  await revokedUserAccessRepository.revokeSession({ userId, sessionId, revokeUntil });
}
