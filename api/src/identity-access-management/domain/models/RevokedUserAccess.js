export class RevokedUserAccess {
  /**
   * @param {{
   *   revokedAllTimeStamp?: number
   *   revokedSessionTimeStamps?: Record<string, number | undefined>
   * }} param
   */
  constructor({ revokedAllTimeStamp, revokedSessionTimeStamps }) {
    this.revokedAllTimeStamp = revokedAllTimeStamp;
    this.revokedSessionTimeStamps = revokedSessionTimeStamps;
  }

  isAccessTokenRevoked(decodedToken) {
    const issuedAt = decodedToken.iat;
    if (this.revokedAllTimeStamp && issuedAt < this.revokedAllTimeStamp) {
      return true;
    }

    const sessionId = decodedToken.sid;
    if (this.revokedSessionTimeStamps?.[sessionId] && issuedAt < this.revokedSessionTimeStamps[sessionId]) {
      return true;
    }

    return false;
  }
}
