import crypto from 'node:crypto';

export class PKCEUtils {
  static generateCodeVerifier(length = 128) {
    if (length < 43 || length > 128) {
      throw new Error('Code verifier length must be between 43 and 128 characters');
    }

    const randomBytes = crypto.randomBytes(length);
    return randomBytes.toString('base64url').substring(0, length);
  }

  static generateCodeChallenge(codeVerifier, method = 'S256') {
    if (method === 'plain') {
      return codeVerifier;
    }

    if (method === 'S256') {
      const hash = crypto.createHash('sha256').update(codeVerifier).digest();
      return hash.toString('base64url');
    }

    throw new Error(`Unsupported code challenge method: ${method}`);
  }

  static validateCodeVerifier(codeVerifier) {
    if (typeof codeVerifier !== 'string') {
      return false;
    }

    if (codeVerifier.length < 43 || codeVerifier.length > 128) {
      return false;
    }

    const validChars = /^[A-Za-z0-9\-._~]+$/;
    return validChars.test(codeVerifier);
  }

  static validateCodeChallenge(codeChallenge, codeVerifier, method) {
    if (!this.validateCodeVerifier(codeVerifier)) {
      return false;
    }

    const expectedChallenge = this.generateCodeChallenge(codeVerifier, method);
    return codeChallenge === expectedChallenge;
  }

  static isSecureRandomString(str, minEntropy = 32) {
    if (str.length < minEntropy) {
      return false;
    }

    const charSet = new Set(str);
    const uniqueChars = charSet.size;
    const entropy = Math.log2(uniqueChars) * str.length;

    return entropy >= minEntropy * 8;
  }

  static validateCodeChallengeMethod(method) {
    return method === 'S256' || method === 'plain';
  }

  static recommendSecureMethod() {
    return 'S256';
  }
}

export function createPKCEPair() {
  const codeVerifier = PKCEUtils.generateCodeVerifier();
  const codeChallenge = PKCEUtils.generateCodeChallenge(codeVerifier, 'S256');

  return {
    codeVerifier,
    codeChallenge,
    method: 'S256',
  };
}
