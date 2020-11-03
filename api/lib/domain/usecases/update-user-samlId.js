const {
  InvalidExternalUserTokenError,
  UnexpectedUserAccount,
  UserAlreadyExistsWithAuthenticationMethodError,
} = require('../../domain/errors');

module.exports = async function updateUserSamlId({
  userId,
  externalUserToken,
  expectedUserId,
  tokenService,
  userRepository,
  obfuscationService,
}) {
  if (expectedUserId !== userId) {
    const user = await userRepository.getUserAuthenticationMethods(expectedUserId);
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

  return userRepository.updateSamlId({ userId, samlId });
};
