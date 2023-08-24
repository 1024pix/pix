const getReadyIdentityProviders = function ({ authenticationServiceRegistry }) {
  return authenticationServiceRegistry.getReadyOidcProviderServices();
};

export { getReadyIdentityProviders };
