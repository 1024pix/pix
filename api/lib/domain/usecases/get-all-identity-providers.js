const getAllIdentityProviders = function ({ oidcAuthenticationServiceRegistry }) {
  oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  return oidcAuthenticationServiceRegistry.getAllOidcProviderServices();
};

export { getAllIdentityProviders };
