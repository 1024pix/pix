import { AuthenticationKeyExpired, DifferentExternalIdentifierError } from '../errors.js';
import { AuthenticationMethod } from '../models/index.js';

const reconcileOidcUserForAdmin = async function ({
  email,
  identityProvider,
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

  const foundUser = await userRepository.getByEmail(email);

  const authenticationMethods = await authenticationMethodRepository.findByUserId({ userId: foundUser.id });
  const oidcAuthenticationMethod = authenticationMethods.find(
    (authenticationMethod) => authenticationMethod.identityProvider === identityProvider,
  );

  const isSameExternalIdentifier =
    oidcAuthenticationMethod?.externalIdentifier === sessionContentAndUserInfo.userInfo.externalIdentityId;
  if (oidcAuthenticationMethod && !isSameExternalIdentifier) {
    throw new DifferentExternalIdentifierError();
  }

  const userId = foundUser.id;

  const { userInfo, sessionContent } = sessionContentAndUserInfo;
  const { externalIdentityId } = userInfo;

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
  userRepository.updateLastLoggedAt({ userId });

  return accessToken;
};

export { reconcileOidcUserForAdmin };
