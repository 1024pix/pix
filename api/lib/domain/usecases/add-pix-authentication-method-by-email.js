const { AuthenticationMethodAlreadyExistsError } = require('../errors');

module.exports = async function addPixAuthenticationMethodByEmail({ userId, authenticationMethodRepository }) {
  const alreadyHasPixAuthenticationMethod = await authenticationMethodRepository.hasIdentityProviderPIX({ userId });

  if (alreadyHasPixAuthenticationMethod) {
    throw new AuthenticationMethodAlreadyExistsError();
  } else {
    // TODO
  }
};
