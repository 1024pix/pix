const OidcIdentityProviders = require('../../constants/oidc-identity-providers');

function lookupAuthenticationService(identityProvider) {
  const identityProviderService = Object.values(OidcIdentityProviders).find(
    (oidcIdentityProvider) => oidcIdentityProvider.code === identityProvider
  );

  if (!identityProviderService) throw new Error(`Identity provider ${identityProvider} is not supported`);

  return identityProviderService;
}

module.exports = {
  lookupAuthenticationService,
};
