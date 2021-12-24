const { AuthenticationMethodAlreadyExistsError } = require('../errors');

module.exports = async function addPixAuthenticationMethodByEmail({
  userId,
  email,
  userRepository,
  authenticationMethodRepository,
}) {
  await userRepository.checkIfEmailIsAvailable(email);

  const alreadyHasPixAuthenticationMethod = await authenticationMethodRepository.hasIdentityProviderPIX({ userId });

  if (alreadyHasPixAuthenticationMethod) {
    throw new AuthenticationMethodAlreadyExistsError();
  } else {
    // TODO
  }
};
