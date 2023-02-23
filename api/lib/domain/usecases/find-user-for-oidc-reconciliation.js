const { AuthenticationKeyExpired, DifferentExternalIdentifierError } = require('../errors.js');

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
  const sessionContentAndUserInfo = await authenticationSessionService.getByKey(authenticationKey);
  if (!sessionContentAndUserInfo) {
    throw new AuthenticationKeyExpired();
  }

  const foundUser = await pixAuthenticationService.getUserByUsernameAndPassword({
    username: email,
    password,
    userRepository,
  });

  const authenticationMethods = await authenticationMethodRepository.findByUserId({ userId: foundUser.id });
  const oidcAuthenticationMethod = authenticationMethods.find(
    (authenticationMethod) => authenticationMethod.identityProvider === identityProvider
  );

  const isSameExternalIdentifier =
    oidcAuthenticationMethod?.externalIdentifier === sessionContentAndUserInfo.userInfo.externalIdentityId;
  if (oidcAuthenticationMethod && !isSameExternalIdentifier) {
    throw new DifferentExternalIdentifierError();
  }

  sessionContentAndUserInfo.userInfo.userId = foundUser.id;
  await authenticationSessionService.update(authenticationKey, sessionContentAndUserInfo);

  const fullNameFromPix = `${foundUser.firstName} ${foundUser.lastName}`;
  const fullNameFromExternalIdentityProvider = `${sessionContentAndUserInfo.userInfo.firstName} ${sessionContentAndUserInfo.userInfo.lastName}`;

  return {
    fullNameFromPix,
    fullNameFromExternalIdentityProvider,
    email: foundUser.email,
    username: foundUser.username,
    authenticationMethods,
  };
};
