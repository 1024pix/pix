export class RevokedUserAccess {
  /**
   * @param {{
   *   revokedAllTimeStamp?: number
   *   revokedSessions?: string[]
   * }} param
   */
  constructor({ revokedAllTimeStamp, revokedSessions }) {
    this.revokedAllTimeStamp = revokedAllTimeStamp;
    this.revokedSessions = revokedSessions;
  }

  isAccessTokenRevoked(decodedToken) {
    const issuedAt = decodedToken.iat;
    if (this.revokedAllTimeStamp && issuedAt < this.revokedAllTimeStamp) {
      return true;
    }

    const sessionId = decodedToken.sid;
    if (this.revokedSessions?.includes(sessionId)) {
      return true;
    }

    return false;
  }
}
