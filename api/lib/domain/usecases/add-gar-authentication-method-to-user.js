const {
  InvalidExternalUserTokenError,
  UnexpectedUserAccount,
  UserAlreadyExistsWithAuthenticationMethodError,
} = require('../../domain/errors');
const AuthenticationMethod = require('../models/AuthenticationMethod');

module.exports = async function addGarAuthenticationMethodToUser({
  userId,
  externalUserToken,
  expectedUserId,
  tokenService,
  userRepository,
  obfuscationService,
  authenticationMethodRepository,
}) {
  if (expectedUserId !== userId) {
    const user = await userRepository.getForObfuscation(expectedUserId);
    const authenticationMethod = await obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

    throw new UnexpectedUserAccount({
      code: 'UNEXPECTED_USER_ACCOUNT',
      meta: { value: authenticationMethod.value },
    });
  }

  const samlId = tokenService.extractSamlId(externalUserToken);
  if (!samlId) {
    throw new InvalidExternalUserTokenError('Une erreur est survenue. Veuillez réessayer de vous connecter depuis le médiacentre.');
  }

  const foundUserBySamlId = await userRepository.getBySamlId(samlId);
  if (foundUserBySamlId && foundUserBySamlId.id !== userId) {
    throw new UserAlreadyExistsWithAuthenticationMethodError();
  }

  const authenticationMethod = new AuthenticationMethod({
    identityProvider: AuthenticationMethod.identityProviders.GAR,
    externalIdentifier: samlId,
    userId,
  });
  await authenticationMethodRepository.create({ authenticationMethod });
};
