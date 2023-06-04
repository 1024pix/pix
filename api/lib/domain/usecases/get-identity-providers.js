const getIdentityProviders = function ({ authenticationServiceRegistry }) {
  return authenticationServiceRegistry.getOidcProviderServices().filter((oidcProvider) => oidcProvider.isReady);
};

export { getIdentityProviders };
