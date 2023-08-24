const getAllIdentityProviders = function ({ authenticationServiceRegistry }) {
  return authenticationServiceRegistry.getAllOidcProviderServices();
};

export { getAllIdentityProviders };
