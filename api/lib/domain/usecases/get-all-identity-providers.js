const getAllIdentityProviders = function ({ authenticationServiceRegistry }) {
  return authenticationServiceRegistry.getReadyOidcProviderServicesForPixAdmin();
};

export { getAllIdentityProviders };
