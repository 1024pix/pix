import { AuthenticationKeyExpired, MissingUserAccountError } from '../errors.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';

const reconcileOidcUser = async function ({
  authenticationKey,
  oidcAuthenticationService,
  authenticationSessionService,
  authenticationMethodRepository,
  userRepository,
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

  const authenticationComplement = oidcAuthenticationService.createAuthenticationComplement({ sessionContent });
  await authenticationMethodRepository.create({
    authenticationMethod: new AuthenticationMethod({
      identityProvider: oidcAuthenticationService.identityProvider,
      userId,
      externalIdentifier: externalIdentityId,
      authenticationComplement,
    }),
  });

  const accessToken = await oidcAuthenticationService.createAccessToken(userId);
  const logoutUrlUUID = await oidcAuthenticationService.saveIdToken({
    idToken: sessionContent.idToken,
    userId,
  });
  userRepository.updateLastLoggedAt({ userId });

  return { accessToken, logoutUrlUUID };
};

export { reconcileOidcUser };
