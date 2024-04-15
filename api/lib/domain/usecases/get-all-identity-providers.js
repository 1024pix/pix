const getAllIdentityProviders = async function ({ oidcAuthenticationServiceRegistry }) {
  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  return oidcAuthenticationServiceRegistry.getAllOidcProviderServices();
};

export { getAllIdentityProviders };
