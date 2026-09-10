import { InvalidInputDataError } from '../../../shared/domain/errors.js';

export class RevokedUserAccess {
  /**
   * @param {{
   *   revokedAllTimeStamp?: number
   *   revokedSessionIds?: string[]
   * }} param
   */
  constructor({ revokedAllTimeStamp, revokedSessionIds }) {
    this.revokedAllTimeStamp = revokedAllTimeStamp;
    this.revokedSessionIds = revokedSessionIds;
  }

  /**
   * @param {{
   *   iat: number
   *   sid: string
   * }} decodedToken
   * @returns
   */
  isAccessTokenRevoked(decodedToken) {
    const issuedAt = decodedToken.iat;
    if (this.revokedAllTimeStamp && issuedAt < this.revokedAllTimeStamp) {
      return true;
    }

    const sessionId = decodedToken.sid;
    if (this.revokedSessionIds?.includes(sessionId)) {
      return true;
    }

    return false;
  }

  /**
   * @param {import('./UserRefreshToken.js').UserRefreshToken} refreshToken
   */
  assertRefreshTokenNotRevoked(refreshToken) {
    if (this.revokedSessionIds?.includes(refreshToken.sessionId)) {
      throw new InvalidInputDataError(
        `Refresh token is revoked because sessionId ${refreshToken.sessionId} is revoked`,
        'INVALID_REFRESH_TOKEN',
      );
    }
  }
}
