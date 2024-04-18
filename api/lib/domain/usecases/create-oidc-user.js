import { AuthenticationKeyExpired, UserAlreadyExistsWithAuthenticationMethodError } from '../errors.js';
import { UserToCreate } from '../models/UserToCreate.js';

const createOidcUser = async function ({
  identityProvider,
  authenticationKey,
  localeFromCookie,
  authenticationSessionService,
  oidcAuthenticationService,
  authenticationMethodRepository,
  userToCreateRepository,
  userAccountApi,
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
      'Authentication method already exists for this external identifier.',
    );
  }

  const user = UserToCreate.createWithTermsOfServiceAccepted({
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    locale: localeFromCookie,
  });

  const userId = await oidcAuthenticationService.createUserAccount({
    user,
    userInfo,
    sessionContent,
    externalIdentityId: userInfo.externalIdentityId,
    userToCreateRepository,
    authenticationMethodRepository,
  });

  const accessToken = oidcAuthenticationService.createAccessToken(userId);

  let logoutUrlUUID;
  if (oidcAuthenticationService.shouldCloseSession) {
    logoutUrlUUID = await oidcAuthenticationService.saveIdToken({ idToken: sessionContent.idToken, userId });
  }

  await userAccountApi.updateUserAccountLastLoggedAtDate(userId);

  return { accessToken, logoutUrlUUID };
};

export { createOidcUser };
