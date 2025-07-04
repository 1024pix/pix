export class PKCEUtils {
  static async createPKCEPair() {
    const codeVerifier = PKCEUtils.generateCodeVerifier();
    const codeChallenge = await PKCEUtils.generateCodeChallenge(codeVerifier, 'S256');

    return {
      codeVerifier,
      codeChallenge,
      method: 'S256',
    };
  }

  static generateCodeVerifier(length = 128) {
    if (length < 43 || length > 128) {
      throw new Error('Code verifier length must be between 43 and 128 characters');
    }

    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);
    return this.base64UrlEncode(randomBytes).substring(0, length);
  }

  static async generateCodeChallenge(codeVerifier, method = 'S256') {
    if (method === 'plain') {
      return codeVerifier;
    }

    if (method === 'S256') {
      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      const digest = await crypto.subtle.digest('SHA-256', data);
      return this.base64UrlEncode(new Uint8Array(digest));
    }

    throw new Error(`Unsupported code challenge method: ${method}`);
  }

  static base64UrlEncode(uint8) {
    const base64 = btoa(String.fromCharCode(...uint8));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
