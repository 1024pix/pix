import { isEmpty, isNil, pick } from 'lodash';
import * as OidcIdentityProviders from '../constants/oidc-identity-providers.js';
import { config } from '../../config.js';

const getIdentityProviders = function () {
  return Object.keys(OidcIdentityProviders)
    .map((oidcIdentityProviderKey) => {
      const { configKey, propertyPathsToPick, service } = OidcIdentityProviders[oidcIdentityProviderKey];

      const providerConfig = pick(config[configKey], propertyPathsToPick);
      const providerConfigKeys = Object.keys(providerConfig);

      if (providerConfigKeys.length === 0) {
        return;
      }

      const providerConfigExists = propertyPathsToPick.every(
        (providerConfigKey) => !isNil(providerConfig[providerConfigKey])
      );

      if (providerConfigExists) {
        return service;
      }
    })
    .filter((identityProvider) => !isEmpty(identityProvider));
};

export { getIdentityProviders };
