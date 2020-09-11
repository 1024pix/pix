const { InvalidExternalUserTokenError, UserAlreadyExistsWithAuthenticationMethodError } = require('../../domain/errors');

module.exports = async function updateUserSamlId({
  userId,
  externalUserToken,
  tokenService,
  userRepository,
}) {
  const samlId = tokenService.extractSamlId(externalUserToken);
  if (!samlId) {
    throw new InvalidExternalUserTokenError();
  }

  const foundUserBySamlId = await userRepository.getBySamlId(samlId);
  if (foundUserBySamlId && foundUserBySamlId.id !== userId) {
    throw new UserAlreadyExistsWithAuthenticationMethodError();
  }

  return userRepository.updateSamlId({ userId, samlId });
};
