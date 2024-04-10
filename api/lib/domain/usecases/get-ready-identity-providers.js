const getReadyIdentityProviders = function ({ audience = 'app', oidcAuthenticationServiceRegistry }) {
  if (audience === 'admin') {
    return oidcAuthenticationServiceRegistry.getReadyOidcProviderServicesForPixAdmin();
  }
  return oidcAuthenticationServiceRegistry.getReadyOidcProviderServices();
};

export { getReadyIdentityProviders };
