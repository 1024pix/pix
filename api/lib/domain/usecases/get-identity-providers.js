const getIdentityProviders = function ({ authenticationServiceRegistry }) {
  return authenticationServiceRegistry.getReadyOidcProviderServices();
};

export { getIdentityProviders };
