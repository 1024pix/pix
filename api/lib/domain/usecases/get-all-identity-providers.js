const getAllIdentityProviders = function ({ oidcAuthenticationServiceRegistry }) {
  return oidcAuthenticationServiceRegistry.getAllOidcProviderServices();
};

export { getAllIdentityProviders };
