const OidcIdentityProviders = require('../../constants/oidc-identity-providers.js');
const { InvalidIdentityProviderError } = require('../../errors.js');

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
