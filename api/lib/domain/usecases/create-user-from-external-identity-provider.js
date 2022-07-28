const UserToCreate = require('../models/UserToCreate');
const { AuthenticationKeyExpired, UserAlreadyExistsWithAuthenticationMethodError } = require('../errors');

module.exports = async function createUserFromExternalIdentityProvider({
  identityProvider,
  authenticationKey,
  authenticationSessionService,
  authenticationServiceRegistry,
  authenticationMethodRepository,
  userToCreateRepository,
}) {
  const sessionContent = await authenticationSessionService.getByKey(authenticationKey);
  if (!sessionContent) {
    throw new AuthenticationKeyExpired();
  }
  const oidcAuthenticationService = await authenticationServiceRegistry.lookupAuthenticationService(identityProvider);
  const userInfo = await oidcAuthenticationService.getUserInfo({
    idToken: sessionContent.idToken,
    accessToken: sessionContent.accessToken,
  });

  const authenticationMethod = await authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider({
    externalIdentifier: userInfo.externalIdentityId,
    identityProvider,
  });

  if (authenticationMethod) {
    throw new UserAlreadyExistsWithAuthenticationMethodError(
      'Authentication method already exists for this external identifier.'
    );
  }

  const user = UserToCreate.createWithTermsOfServiceAccepted({
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
  });

  return await oidcAuthenticationService.createUserAccount({
    user,
    sessionContent,
    externalIdentityId: userInfo.externalIdentityId,
    userToCreateRepository,
    authenticationMethodRepository,
  });
};
