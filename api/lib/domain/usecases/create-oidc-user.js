const UserToCreate = require('../models/UserToCreate');
const { AuthenticationKeyExpired, UserAlreadyExistsWithAuthenticationMethodError } = require('../errors');

module.exports = async function createOidcUser({
  identityProvider,
  authenticationKey,
  authenticationSessionService,
  authenticationServiceRegistry,
  authenticationMethodRepository,
  userToCreateRepository,
}) {
  const sessionContentAndUserInfo = await authenticationSessionService.getByKey(authenticationKey);
  if (!sessionContentAndUserInfo) {
    throw new AuthenticationKeyExpired();
  }
  const { userInfo, sessionContent } = sessionContentAndUserInfo;
  const oidcAuthenticationService = await authenticationServiceRegistry.lookupAuthenticationService(identityProvider);

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
