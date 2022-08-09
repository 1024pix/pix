const { AuthenticationKeyExpired, DifferentExternalIdentifierError } = require('../errors');

module.exports = async function findUserForOidcReconciliation({
  authenticationKey,
  email,
  password,
  identityProvider,
  authenticationSessionService,
  pixAuthenticationService,
  oidcAuthenticationService,
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

  const isSameExternalIdentifier =
    oidcAuthenticationMethod.externalIdentifier === sessionContentAndUserInfo.userInfo.externalIdentityId;

  if (!isSameExternalIdentifier) {
    throw new DifferentExternalIdentifierError();
  }

  const pixAccessToken = await oidcAuthenticationService.createAccessToken(foundUser.id);
  const logoutUrlUUID = await oidcAuthenticationService.saveIdToken({
    idToken: sessionContentAndUserInfo.sessionContent.idToken,
    userId: foundUser.id,
  });

  userRepository.updateLastLoggedAt({ userId: foundUser.id });

  return { pixAccessToken, logoutUrlUUID };
};
