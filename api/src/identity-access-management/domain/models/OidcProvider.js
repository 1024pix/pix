export class OidcProvider {
  constructor({
    accessTokenLifespan,
    additionalRequiredProperties,
    application,
    applicationTld,
    claimMapping,
    claimsToStore,
    clientId,
    connectionMethodCode,
    enabled,
    enabledForPixAdmin,
    encryptedClientSecret,
    extraAuthorizationUrlParameters,
    identityProvider,
    openidClientExtraMetadata,
    openidConfigurationUrl,
    organizationName,
    postLogoutRedirectUri,
    redirectUri,
    scope,
    shouldCloseSession,
    slug,
    source,
    isVisible,
  } = {}) {
    this.accessTokenLifespan = accessTokenLifespan;
    this.additionalRequiredProperties = additionalRequiredProperties;
    this.application = application;
    this.applicationTld = applicationTld;
    this.claimMapping = claimMapping;
    this.claimsToStore = claimsToStore;
    this.clientId = clientId;
    this.connectionMethodCode = connectionMethodCode;
    this.enabled = enabled;
    this.enabledForPixAdmin = enabledForPixAdmin;
    this.encryptedClientSecret = encryptedClientSecret;
    this.extraAuthorizationUrlParameters = extraAuthorizationUrlParameters;
    this.identityProvider = identityProvider;
    this.openidClientExtraMetadata = openidClientExtraMetadata;
    this.openidConfigurationUrl = openidConfigurationUrl;
    this.organizationName = organizationName;
    this.postLogoutRedirectUri = postLogoutRedirectUri;
    this.redirectUri = redirectUri;
    this.scope = scope;
    this.shouldCloseSession = shouldCloseSession;
    this.slug = slug;
    this.source = source;
    this.isVisible = isVisible;
  }

  get code() {
    return this.identityProvider;
  }

  /**
   * @param {CryptoService} cryptoService
   * @return {Promise<string | null}>}
   */
  async decryptClientSecret(cryptoService) {
    if (!this.encryptedClientSecret) return null;
    this.clientSecret = await cryptoService.decrypt(this.encryptedClientSecret);
  }
}
