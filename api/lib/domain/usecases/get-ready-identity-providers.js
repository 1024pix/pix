const getReadyIdentityProviders = async function ({ audience = 'app', oidcAuthenticationServiceRegistry }) {
  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  if (audience === 'admin') {
    return oidcAuthenticationServiceRegistry.getReadyOidcProviderServicesForPixAdmin();
  }
  return oidcAuthenticationServiceRegistry.getReadyOidcProviderServices();
};

export { getReadyIdentityProviders };
