const { isEmpty, isNil, pick } = require('lodash');
const OidcIdentityProviders = require('../constants/oidc-identity-providers.js');
const config = require('../../config.js');

module.exports = function getIdentityProviders() {
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
