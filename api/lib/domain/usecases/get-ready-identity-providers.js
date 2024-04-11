const getReadyIdentityProviders = function ({ audience = 'app', oidcAuthenticationServiceRegistry }) {
  oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  if (audience === 'admin') {
    return oidcAuthenticationServiceRegistry.getReadyOidcProviderServicesForPixAdmin();
  }
  return oidcAuthenticationServiceRegistry.getReadyOidcProviderServices();
};

export { getReadyIdentityProviders };
