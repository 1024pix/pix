const OidcIdentityProviders = require('../../constants/oidc-identity-providers');
const { InvalidIdentityProviderError } = require('../../errors');

function lookupAuthenticationService(identityProvider) {
  const identityProviderService = Object.values(OidcIdentityProviders).find(
    (oidcIdentityProvider) => oidcIdentityProvider.service.code === identityProvider
  );

  if (!identityProviderService) throw new InvalidIdentityProviderError(identityProvider);

  return identityProviderService.service;
}

module.exports = {
  lookupAuthenticationService,
};
