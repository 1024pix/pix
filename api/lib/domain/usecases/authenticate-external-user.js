import {
  UserNotFoundError,
  UnexpectedUserAccountError,
  UserAlreadyExistsWithAuthenticationMethodError,
} from '../errors.js';

import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import {
  MissingOrInvalidCredentialsError,
  PasswordNotMatching,
  UserShouldChangePasswordError,
} from '../../../src/access/authentication/domain/errors.js';

async function authenticateExternalUser({
  username,
  password,
  externalUserToken,
  expectedUserId,
  tokenService,
  pixAuthenticationService,
  obfuscationService,
  authenticationMethodRepository,
  userRepository,
  userLoginRepository,
}) {
  try {
    const userFromCredentials = await pixAuthenticationService.getUserByUsernameAndPassword({
      username,
      password,
      userRepository,
    });

    if (userFromCredentials.id !== expectedUserId) {
      const expectedUser = await userRepository.getForObfuscation(expectedUserId);
      const authenticationMethod = await obfuscationService.getUserAuthenticationMethodWithObfuscation(expectedUser);

      throw new UnexpectedUserAccountError({
        message: undefined,
        meta: { value: authenticationMethod.value },
      });
    }

    await _addGarAuthenticationMethod({
      userId: userFromCredentials.id,
      externalUserToken,
      tokenService,
      authenticationMethodRepository,
      userRepository,
    });

    if (userFromCredentials.shouldChangePassword) {
      const passwordResetToken = tokenService.createPasswordResetToken(userFromCredentials.id);
      throw new UserShouldChangePasswordError(undefined, passwordResetToken);
    }

    const token = tokenService.createAccessTokenForSaml(userFromCredentials.id);

    await userLoginRepository.updateLastLoggedAt({ userId: userFromCredentials.id });

    return token;
  } catch (error) {
    if (error instanceof UserNotFoundError || error instanceof PasswordNotMatching) {
      throw new MissingOrInvalidCredentialsError();
    } else {
      throw error;
    }
  }
}

async function _addGarAuthenticationMethod({
  userId,
  externalUserToken,
  tokenService,
  authenticationMethodRepository,
  userRepository,
}) {
  const { samlId, firstName, lastName } = await tokenService.extractExternalUserFromIdToken(externalUserToken);
  await _checkIfSamlIdIsNotReconciledWithAnotherUser({ samlId, userId, userRepository });

  const garAuthenticationMethod = new AuthenticationMethod({
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
    externalIdentifier: samlId,
    userId,
    authenticationComplement: new AuthenticationMethod.GARAuthenticationComplement({
      firstName,
      lastName,
    }),
  });
  await authenticationMethodRepository.create({ authenticationMethod: garAuthenticationMethod });
}

const _checkIfSamlIdIsNotReconciledWithAnotherUser = async ({ samlId, userId, userRepository }) => {
  const userFromCredentialsBySamlId = await userRepository.getBySamlId(samlId);
  if (userFromCredentialsBySamlId && userFromCredentialsBySamlId.id !== userId) {
    throw new UserAlreadyExistsWithAuthenticationMethodError();
  }
};

export { authenticateExternalUser };
