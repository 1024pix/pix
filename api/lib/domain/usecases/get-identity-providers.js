const getIdentityProviders = function ({ authenticationServiceRegistry }) {
  return authenticationServiceRegistry.getOidcProviderServices();
};

export { getIdentityProviders };
