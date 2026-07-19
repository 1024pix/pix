import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import { UserAccessToken } from '../models/UserAccessToken.js';
import { UserReconciliationSamlIdToken } from '../models/UserReconciliationSamlIdToken.js';

const getSamlAuthenticationRedirectionUrl = async function ({
  userAttributes,
  userRepository,
  userLoginRepository,
  authenticationMethodRepository,
  lastUserApplicationConnectionsRepository,
  authenticationSessionService,
  config,
  audience,
  requestedApplication,
}) {
  const { attributeMapping } = config.saml;
  const externalUser = {
    firstName: userAttributes[attributeMapping.firstName],
    lastName: userAttributes[attributeMapping.lastName],
    samlId: userAttributes[attributeMapping.samlId],
  };

  const user = await userRepository.getBySamlId(externalUser.samlId);
  if (user) {
    await _updateUserLastConnection({
      user,
      requestedApplication,
      authenticationMethodRepository,
      lastUserApplicationConnectionsRepository,
      userLoginRepository,
    });

    await _saveUserFirstAndLastName({
      authenticationMethodRepository,
      user,
      externalUser,
    });

    const sessionId = authenticationSessionService.generateSessionId();
    const { accessToken } = UserAccessToken.generateSamlUserToken({ userId: user.id, sessionId, audience });
    return `/connexion/gar#${encodeURIComponent(accessToken)}`;
  }

  const userReconciliationSamlIdToken = UserReconciliationSamlIdToken.generate(externalUser);
  return `/campagnes?externalUser=${encodeURIComponent(userReconciliationSamlIdToken)}`;
};

export { getSamlAuthenticationRedirectionUrl };

function _externalUserFirstAndLastNameMatchesAuthenticationMethodFirstAndLastName({
  authenticationMethod,
  externalUser,
}) {
  return (
    externalUser.firstName === authenticationMethod.authenticationComplement?.firstName &&
    externalUser.lastName === authenticationMethod.authenticationComplement?.lastName
  );
}

async function _saveUserFirstAndLastName({ authenticationMethodRepository, user, externalUser }) {
  const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId: user.id,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
  });

  if (
    _externalUserFirstAndLastNameMatchesAuthenticationMethodFirstAndLastName({ authenticationMethod, externalUser })
  ) {
    return;
  }

  authenticationMethod.authenticationComplement = new AuthenticationMethod.GARAuthenticationComplement({
    firstName: externalUser.firstName,
    lastName: externalUser.lastName,
  });

  authenticationMethodRepository.update(authenticationMethod);
}

async function _updateUserLastConnection({
  user,
  requestedApplication,
  authenticationMethodRepository,
  lastUserApplicationConnectionsRepository,
  userLoginRepository,
}) {
  await userLoginRepository.updateLastLoggedAt({ userId: user.id });
  await lastUserApplicationConnectionsRepository.upsert({
    userId: user.id,
    application: requestedApplication.applicationName,
    lastLoggedAt: new Date(),
  });
  await authenticationMethodRepository.updateLastLoggedAtByIdentityProvider({
    userId: user.id,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
  });
}
