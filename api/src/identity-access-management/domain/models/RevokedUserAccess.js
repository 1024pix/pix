export class RevokedUserAccess {
  constructor({ revokeTimeStamp, revokeSessions }) {
    this.revokeTimeStamp = revokeTimeStamp;
    this.revokeSessions = revokeSessions;
  }

  isAccessTokenRevoked(decodedToken) {
    const issuedAt = decodedToken.iat;
    if (!this.revokeTimeStamp) {
      return false;
    }
    return issuedAt < this.revokeTimeStamp;
  }
}
