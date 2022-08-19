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

    const fullNameFromPix = `${foundUser.firstName} ${foundUser.lastName}`;
    const fullNameFromExternalIdentityProvider = `${sessionContentAndUserInfo.userInfo.firstName} ${sessionContentAndUserInfo.userInfo.lastName}`;

    return {
      fullNameFromPix,
      fullNameFromExternalIdentityProvider,
      email: foundUser.email,
      username: foundUser.username,
    };
  }

  const isSameExternalIdentifier =
    oidcAuthenticationMethod.externalIdentifier === sessionContentAndUserInfo.userInfo.externalIdentityId;

  if (!isSameExternalIdentifier) {
    throw new DifferentExternalIdentifierError();
  }

  await _updateAuthenticationComplement({
    identityProvider,
    userId: foundUser.id,
    sessionContent: sessionContentAndUserInfo.sessionContent,
    oidcAuthenticationService,
    authenticationMethodRepository,
  });

  const accessToken = await oidcAuthenticationService.createAccessToken(foundUser.id);

  const logoutUrlUUID = await oidcAuthenticationService.saveIdToken({
    idToken: sessionContentAndUserInfo.sessionContent.idToken,
    userId: foundUser.id,
  });

  userRepository.updateLastLoggedAt({ userId: foundUser.id });

  return { accessToken, logoutUrlUUID };
};

async function _updateAuthenticationComplement({
  identityProvider,
  userId,
  sessionContent,
  oidcAuthenticationService,
  authenticationMethodRepository,
}) {
  const authenticationComplement = oidcAuthenticationService.createAuthenticationComplement({ sessionContent });
  if (!authenticationComplement) return;

  await authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider({
    authenticationComplement,
    userId,
    identityProvider,
  });
}
