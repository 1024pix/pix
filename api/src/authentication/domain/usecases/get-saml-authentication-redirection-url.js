import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../lib/domain/constants/identity-providers.js';
import { AuthenticationMethod } from '../../../../lib/domain/models/AuthenticationMethod.js';

const getSamlAuthenticationRedirectionUrl = async function ({
  userAttributes,
  userRepository,
  userLoginRepository,
  authenticationMethodRepository,
  tokenService,
  config,
}) {
  const { attributeMapping } = config.saml;
  const externalUser = {
    firstName: userAttributes[attributeMapping.firstName],
    lastName: userAttributes[attributeMapping.lastName],
    samlId: userAttributes[attributeMapping.samlId],
  };

  const user = await userRepository.getBySamlId(externalUser.samlId);

  if (user) {
    return await _getUrlWithAccessToken({
      user,
      externalUser,
      tokenService,
      userLoginRepository,
      authenticationMethodRepository,
    });
  }

  return _getUrlForReconciliationPage({ tokenService, externalUser });
};

export { getSamlAuthenticationRedirectionUrl };

async function _getUrlWithAccessToken({
  user,
  externalUser,
  tokenService,
  userLoginRepository,
  authenticationMethodRepository,
}) {
  const token = tokenService.createAccessTokenForSaml(user.id);
  await userLoginRepository.updateLastLoggedAt({ userId: user.id });
  await _saveUserFirstAndLastName({ authenticationMethodRepository, user, externalUser });
  return `/connexion/gar#${encodeURIComponent(token)}`;
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

function _externalUserFirstAndLastNameMatchesAuthenticationMethodFirstAndLastName({
  authenticationMethod,
  externalUser,
}) {
  return (
    externalUser.firstName === authenticationMethod.authenticationComplement?.firstName &&
    externalUser.lastName === authenticationMethod.authenticationComplement?.lastName
  );
}

function _getUrlForReconciliationPage({ tokenService, externalUser }) {
  const externalUserToken = tokenService.createIdTokenForUserReconciliation(externalUser);
  return `/campagnes?externalUser=${encodeURIComponent(externalUserToken)}`;
}
