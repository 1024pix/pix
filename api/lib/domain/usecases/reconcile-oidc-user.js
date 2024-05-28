import { AuthenticationMethod } from '../../../src/identity-access-management/domain/models/AuthenticationMethod.js';
import { AuthenticationKeyExpired, MissingUserAccountError } from '../errors.js';

const reconcileOidcUser = async function ({
  authenticationKey,
  oidcAuthenticationService,
  authenticationSessionService,
  authenticationMethodRepository,
  userLoginRepository,
}) {
  const sessionContentAndUserInfo = await authenticationSessionService.getByKey(authenticationKey);
  if (!sessionContentAndUserInfo) {
    throw new AuthenticationKeyExpired();
  }

  const { userInfo, sessionContent } = sessionContentAndUserInfo;
  if (!userInfo?.userId) {
    throw new MissingUserAccountError();
  }

  const { userId, externalIdentityId } = userInfo;

  const authenticationComplement = oidcAuthenticationService.createAuthenticationComplement({
    userInfo,
    sessionContent,
  });
  await authenticationMethodRepository.create({
    authenticationMethod: new AuthenticationMethod({
      identityProvider: oidcAuthenticationService.identityProvider,
      userId,
      externalIdentifier: externalIdentityId,
      authenticationComplement,
    }),
  });

  const accessToken = await oidcAuthenticationService.createAccessToken(userId);

  let logoutUrlUUID;
  if (oidcAuthenticationService.shouldCloseSession) {
    logoutUrlUUID = await oidcAuthenticationService.saveIdToken({
      idToken: sessionContent.idToken,
      userId,
    });
  }

  await userLoginRepository.updateLastLoggedAt({ userId });

  return { accessToken, logoutUrlUUID };
};

export { reconcileOidcUser };
