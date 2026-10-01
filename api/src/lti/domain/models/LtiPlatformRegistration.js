export class LtiPlatformRegistration {
  static status = Object.freeze({
    ACTIVE: 'active',
    PENDING: 'pending',
  });

  constructor({
    clientId,
    platformOrigin,
    status,
    toolConfig,
    encryptedPrivateKey,
    publicKey,
    platformOpenIdConfigUrl,
  }) {
    this.clientId = clientId;
    this.platformOrigin = platformOrigin;
    this.status = status;
    this.toolConfig = toolConfig;
    this.encryptedPrivateKey = encryptedPrivateKey;
    this.publicKey = publicKey;
    this.platformOpenIdConfigUrl = platformOpenIdConfigUrl;
    this.platformOpenIdConfig = null;
  }

  async fetchPlatformOpenIdConfig({ httpAgent }) {
    const { data: platformOpenIdConfig } = await httpAgent.get({
      url: this.platformOpenIdConfigUrl,
    });
    this.platformOpenIdConfig = platformOpenIdConfig;
  }

  async fetchJwks({ httpAgent }) {
    const { data } = await httpAgent.get({
      url: this.JwksUri,
    });
    return data;
  }

  get isActive() {
    return this.status === LtiPlatformRegistration.status.ACTIVE;
  }

  get authorizationEndpoint() {
    return this.platformOpenIdConfig.authorization_endpoint;
  }

  get JwksUri() {
    return this.platformOpenIdConfig.jwks_uri;
  }
}
