const AuthenticationMethod = require('../models/AuthenticationMethod');
const { UserNotAuthorizedToRemoveAuthenticationMethod } = require('../errors');

module.exports = async function removeAuthenticationMethod({
  userId,
  type,
  userRepository,
  authenticationMethodRepository,
}) {
  const user = await userRepository.get(userId);

  if (type === 'EMAIL') {

    if (!user.username) {
      await _removeAuthenticationMethod(userId, AuthenticationMethod.identityProviders.PIX, authenticationMethodRepository);
    }
    await userRepository.updateEmail({ id: userId, email: null });
  }

  if (type === 'USERNAME') {

    if (!user.email) {
      await _removeAuthenticationMethod(userId, AuthenticationMethod.identityProviders.PIX, authenticationMethodRepository);
    }
    await userRepository.updateUsername({ id: userId, username: null });
  }

  if (type === 'GAR') {
    await _removeAuthenticationMethod(userId, AuthenticationMethod.identityProviders.GAR, authenticationMethodRepository);
  }

  if (type === 'POLE_EMPLOI') {
    await _removeAuthenticationMethod(userId, AuthenticationMethod.identityProviders.POLE_EMPLOI, authenticationMethodRepository);
  }
};

async function _removeAuthenticationMethod(userId, identityProvider, authenticationMethodRepository) {
  const authenticationMethods = await authenticationMethodRepository.findByUserId({ userId });

  if (authenticationMethods.length === 1) {
    throw new UserNotAuthorizedToRemoveAuthenticationMethod();
  }

  await authenticationMethodRepository.removeByUserIdAndIdentityProvider({ userId, identityProvider });
}
