module.exports = async function findUserForOidcReconciliation({
  email,
  password,
  identityProvider,
  pixAuthenticationService,
  authenticationMethodRepository,
  userRepository,
}) {
  const foundUser = await pixAuthenticationService.getUserByUsernameAndPassword({
    username: email,
    password,
    userRepository,
  });

  await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId: foundUser.id,
    identityProvider: identityProvider,
  });
};
