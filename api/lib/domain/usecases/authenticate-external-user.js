const {
  MissingOrInvalidCredentialsError,
  UserNotFoundError,
  PasswordNotMatching,
  UserShouldChangePasswordError,
  UnexpectedUserAccountError,
  InvalidExternalUserTokenError,
  UserAlreadyExistsWithAuthenticationMethodError,
} = require('../errors');

const AuthenticationMethod = require('../models/AuthenticationMethod');

async function authenticateExternalUser({
  username,
  password,
  externalUserToken,
  expectedUserId,
  tokenService,
  authenticationService,
  obfuscationService,
  authenticationMethodRepository,
  userRepository,
}) {
  try {
    const userFromCredentials = await authenticationService.getUserByUsernameAndPassword({
      username,
      password,
      userRepository,
    });

    if (userFromCredentials.id !== expectedUserId) {
      const expectedUser = await userRepository.getForObfuscation(expectedUserId);
      const authenticationMethod = await obfuscationService.getUserAuthenticationMethodWithObfuscation(expectedUser);

      throw new UnexpectedUserAccountError({
        message: undefined,
        code: 'UNEXPECTED_USER_ACCOUNT',
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
      throw new UserShouldChangePasswordError();
    }

    const token = tokenService.createAccessTokenForSaml(userFromCredentials.id);
    await userRepository.updateLastLoggedAt({ userId: userFromCredentials.id });
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
  const tokenData = await tokenService.extractExternalUserFromIdToken(externalUserToken);
  if (!tokenData) {
    throw new InvalidExternalUserTokenError(
      'Une erreur est survenue. Veuillez réessayer de vous connecter depuis le médiacentre.'
    );
  }
  const { samlId, firstName, lastName } = tokenData;

  await _checkIfSamlIdIsNotReconciledWithAnotherUser({ samlId, userId, userRepository });

  const garAuthenticationMethod = new AuthenticationMethod({
    identityProvider: AuthenticationMethod.identityProviders.GAR,
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

module.exports = authenticateExternalUser;
