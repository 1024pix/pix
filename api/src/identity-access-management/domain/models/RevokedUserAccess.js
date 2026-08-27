export class RevokedUserAccess {
  constructor({ revokeTimeStamp, revokeSessions }) {
    this.revokeTimeStamp = revokeTimeStamp;
    this.revokeSessions = revokeSessions;
  }

  isAccessTokenRevoked(decodedToken) {
    const issuedAt = decodedToken.iat;
    if (this.revokeTimeStamp && issuedAt < this.revokeTimeStamp) {
      return true;
    }

    const sessionId = decodedToken.sid;
    if (this.revokeSessions?.[sessionId] && issuedAt < this.revokeSessions[sessionId]) {
      return true;
    }

    return false;
  }
}
