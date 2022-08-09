const { AuthenticationKeyExpired } = require('../errors');

module.exports = async function findUserForOidcReconciliation({
  authenticationKey,
  email,
  password,
  identityProvider,
  authenticationSessionService,
  pixAuthenticationService,
  authenticationMethodRepository,
  userRepository,
}) {
  const foundUser = await pixAuthenticationService.getUserByUsernameAndPassword({
    username: email,
    password,
    userRepository,
  });

  const oidcAuthenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId: foundUser.id,
    identityProvider: identityProvider,
  });

  const sessionContentAndUserInfo = await authenticationSessionService.getByKey(authenticationKey);
  if (!sessionContentAndUserInfo) {
    throw new AuthenticationKeyExpired();
  }

  if (!oidcAuthenticationMethod) {
    sessionContentAndUserInfo.userInfo.userId = foundUser.id;
    await authenticationSessionService.update(authenticationKey, sessionContentAndUserInfo);
    return authenticationKey;
  }
};
