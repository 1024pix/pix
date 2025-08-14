import { config as injectedConfig } from '../../../shared/config.js';
import { tokenService as injectedTokenService } from '../../../shared/domain/services/token-service.js';
import * as injectedUserLoginRepository from '../../../shared/infrastructure/repositories/user-login-repository.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import { lastUserApplicationConnectionsRepository as injectedLastUserApplicationConnectionsRepository } from '../../infrastructure/repositories/last-user-application-connections.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';

const getSamlAuthenticationRedirectionUrl = async function ({
  userAttributes,
  userRepository = injectedUserRepository,
  userLoginRepository = injectedUserLoginRepository,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
  lastUserApplicationConnectionsRepository = injectedLastUserApplicationConnectionsRepository,
  tokenService = injectedTokenService,
  config = injectedConfig,
  audience,
  requestedApplication,
} = {}) {
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

    return _getUrlWithAccessToken({
      user,
      audience,
      externalUser,
      tokenService,
      userLoginRepository,
      authenticationMethodRepository,
      lastUserApplicationConnectionsRepository,
      requestedApplication,
    });
  }

  return _getUrlForReconciliationPage({ tokenService, externalUser });
};

export { getSamlAuthenticationRedirectionUrl };

async function _getUrlWithAccessToken({ user, audience, tokenService }) {
  const token = tokenService.createAccessTokenForSaml({ userId: user.id, audience });

  return `/connexion/gar#${encodeURIComponent(token)}`;
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
