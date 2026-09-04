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
}
