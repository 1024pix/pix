import { ForbiddenAccess, UserNotFoundError } from '../../../shared/domain/errors.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';

async function authenticateOidcUserForPoc({
  code,
  state,
  iss,
  identityProviderCode,
  nonce,
  sessionState,
  requestedApplication,
  oidcAuthenticationServiceRegistry,
  adminMemberRepository,
  userRepository,
  authenticationMethodRepository,
}) {
  await oidcAuthenticationServiceRegistry.loadOidcProviderServices();
  await oidcAuthenticationServiceRegistry.configureReadyOidcProviderServiceByCode(identityProviderCode);

  const oidcAuthenticationService = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode({
    identityProviderCode,
    requestedApplication,
  });

  const sessionContent = await oidcAuthenticationService.exchangeCodeForTokens({
    code,
    state,
    iss,
    nonce,
    sessionState,
  });
  const userInfo = await oidcAuthenticationService.getUserInfo({
    idToken: sessionContent.idToken,
    accessToken: sessionContent.accessToken,
  });

  let user = await userRepository.findByExternalIdentifier({
    externalIdentityId: userInfo.externalIdentityId,
    identityProvider: oidcAuthenticationService.identityProvider,
  });

  // todo(auth): simplified for poc. Should be managed by reconciliation workflow.
  if (!user && userInfo.email) {
    user = await userRepository.getByEmail(userInfo.email);

    if (!user) {
      throw new UserNotFoundError();
    }

    const authenticationComplement = oidcAuthenticationService.createAuthenticationComplement({ userInfo });

    await authenticationMethodRepository.create({
      authenticationMethod: new AuthenticationMethod({
        identityProvider: oidcAuthenticationService.identityProvider,
        userId: user.id,
        externalIdentifier: userInfo.externalIdentityId,
        authenticationComplement,
      }),
    });
  }

  await _assertUserHasAccessToApplication({ requestedApplication, user, adminMemberRepository });

  return user;
}

export { authenticateOidcUserForPoc };

async function _assertUserHasAccessToApplication({ requestedApplication, user, adminMemberRepository }) {
  if (requestedApplication.isPixAdmin) {
    const adminMember = await adminMemberRepository.get({ userId: user.id });
    if (!adminMember?.hasAccessToAdminScope) {
      throw new ForbiddenAccess(
        'User does not have the rights to access the application',
        'PIX_ADMIN_ACCESS_NOT_ALLOWED',
      );
    }
  }
}
