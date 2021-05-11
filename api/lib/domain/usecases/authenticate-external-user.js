const {
  MissingOrInvalidCredentialsError,
  UserNotFoundError,
  PasswordNotMatching,
  UserShouldChangePasswordError,
  UnexpectedUserAccount,
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
    const foundUser = await authenticationService.getUserByUsernameAndPassword({
      username,
      password,
      userRepository,
    });

    if (foundUser.id !== expectedUserId) {
      const authenticationMethod = await obfuscationService
        .getUserAuthenticationMethodWithObfuscation(foundUser);

      throw new UnexpectedUserAccount({
        code: 'UNEXPECTED_USER_ACCOUNT',
        meta: { value: authenticationMethod.value },
      });
    }

    await _addGarAuthenticationMethod({
      userId: foundUser.id,
      externalUserToken,
      tokenService,
      authenticationMethodRepository,
      userRepository,
    });

    if (foundUser.shouldChangePassword) {
      throw new UserShouldChangePasswordError();
    }

    return tokenService.createAccessTokenFromExternalUser(foundUser.id);

  } catch (error) {
    if ((error instanceof UserNotFoundError) || (error instanceof PasswordNotMatching)) {
      throw new MissingOrInvalidCredentialsError();
    } else {
      throw (error);
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
  const samlId = tokenService.extractSamlId(externalUserToken);
  if (!samlId) {
    throw new InvalidExternalUserTokenError('Une erreur est survenue. Veuillez réessayer de vous connecter depuis le médiacentre.');
  }

  const foundUserBySamlId = await userRepository.getBySamlId(samlId);
  if (foundUserBySamlId && foundUserBySamlId.id !== userId) {
    throw new UserAlreadyExistsWithAuthenticationMethodError();
  }

  const garAuthenticationMethod = new AuthenticationMethod({
    identityProvider: AuthenticationMethod.identityProviders.GAR,
    externalIdentifier: samlId,
    userId,
  });
  await authenticationMethodRepository.create({ authenticationMethod: garAuthenticationMethod });
}

module.exports = authenticateExternalUser;
