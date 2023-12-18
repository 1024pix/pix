const getReadyIdentityProviders = function ({ audience = 'app', authenticationServiceRegistry }) {
  if (audience === 'admin') {
    return authenticationServiceRegistry.getReadyOidcProviderServicesForPixAdmin();
  }
  return authenticationServiceRegistry.getReadyOidcProviderServices();
};

export { getReadyIdentityProviders };
