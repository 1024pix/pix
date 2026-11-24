export class LtiPlatformRegistration {
  static status = Object.freeze({
    ACTIVE: 'active',
    PENDING: 'pending',
  });

  /** @type {import('./LtiPlatform.js').LtiPlatform} */
  #platform;

  constructor({ clientId, platform, status, toolConfig, encryptedPrivateKey, publicKey, platformOpenIdConfigUrl }) {
    this.clientId = clientId;
    this.#platform = platform;
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
      url: this.jwksUri,
    });
    return data;
  }

  get isActive() {
    return this.status === LtiPlatformRegistration.status.ACTIVE;
  }

  get authorizationEndpoint() {
    return this.platformOpenIdConfig.authorization_endpoint;
  }

  get jwksUri() {
    return this.platformOpenIdConfig.jwks_uri;
  }

  get ltiToolConfiguration() {
    return this.toolConfig['https://purl.imsglobal.org/spec/lti-tool-configuration'];
  }

  get deploymentId() {
    return this.ltiToolConfiguration.deployment_id;
  }

  get platformId() {
    return this.#platform.id;
  }

  get platformIssuer() {
    return this.#platform.issuer;
  }
}
