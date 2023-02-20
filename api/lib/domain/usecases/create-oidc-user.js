import UserToCreate from '../models/UserToCreate';
import { AuthenticationKeyExpired, UserAlreadyExistsWithAuthenticationMethodError } from '../errors';

export default async function createOidcUser({
  identityProvider,
  authenticationKey,
  authenticationSessionService,
  oidcAuthenticationService,
  authenticationMethodRepository,
  userToCreateRepository,
  userRepository,
}) {
  const sessionContentAndUserInfo = await authenticationSessionService.getByKey(authenticationKey);
  if (!sessionContentAndUserInfo) {
    throw new AuthenticationKeyExpired();
  }

  const { userInfo, sessionContent } = sessionContentAndUserInfo;

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

  const { userId, idToken } = await oidcAuthenticationService.createUserAccount({
    user,
    sessionContent,
    externalIdentityId: userInfo.externalIdentityId,
    userToCreateRepository,
    authenticationMethodRepository,
  });

  const accessToken = oidcAuthenticationService.createAccessToken(userId);
  const logoutUrlUUID = await oidcAuthenticationService.saveIdToken({ idToken, userId });
  await userRepository.updateLastLoggedAt({ userId });

  return { accessToken, logoutUrlUUID };
}
