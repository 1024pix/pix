const getIdentityProviders = function ({ authenticationServiceRegistry }) {
  return authenticationServiceRegistry.getOidcProviderServices().filter((oidcProvider) => oidcProvider.isConfigValid());
};

export { getIdentityProviders };
