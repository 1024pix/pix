import { OidcIdentityProviders } from '../../constants/oidc-identity-providers.js';
import { InvalidIdentityProviderError } from '../../errors.js';

function lookupAuthenticationService(identityProvider) {
  const identityProviderService = Object.values(OidcIdentityProviders).find(
    (oidcIdentityProvider) => oidcIdentityProvider.service.code === identityProvider
  );

  if (!identityProviderService) throw new InvalidIdentityProviderError(identityProvider);

  return identityProviderService.service;
}

export { lookupAuthenticationService };
