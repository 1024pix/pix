import crypto, { randomUUID } from 'node:crypto';

export class AuthorizationCodeStore {
  codes = new Map();

  create({ clientId, userId, redirectUri, scopes, codeChallenge, codeChallengeMethod, expiresInSeconds = 600 }) {
    const code = randomUUID();
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const authCode = {
      code,
      clientId,
      userId,
      redirectUri,
      scopes,
      codeChallenge,
      codeChallengeMethod,
      expiresAt,
      createdAt: new Date(),
      used: false,
    };

    this.codes.set(code, authCode);
    return authCode;
  }

  findByCode(code) {
    return this.codes.get(code);
  }

  consume(code) {
    const authCode = this.codes.get(code);
    if (!authCode) return undefined;

    if (authCode.used) {
      throw new Error('Authorization code already used');
    }

    if (authCode.expiresAt < new Date()) {
      this.codes.delete(code);
      throw new Error('Authorization code expired');
    }

    authCode.used = true;
    return authCode;
  }

  cleanup() {
    const now = new Date();
    for (const [code, authCode] of this.codes.entries()) {
      if (authCode.expiresAt < now || authCode.used) {
        this.codes.delete(code);
      }
    }
  }

  validateCodeChallenge(code, codeVerifier) {
    const authCode = this.codes.get(code);
    if (!authCode) return false;

    if (authCode.codeChallengeMethod === 'plain') {
      return authCode.codeChallenge === codeVerifier;
    }

    if (authCode.codeChallengeMethod === 'S256') {
      const hash = crypto.createHash('sha256').update(codeVerifier).digest();
      const challenge = hash.toString('base64url');
      return authCode.codeChallenge === challenge;
    }

    return false;
  }
}
