const AuthenticationMethod = require('../models/AuthenticationMethod');
const { UserNotAuthorizedToUpdateEmailError, InvalidPasswordForUpdateEmailError } = require('../errors');

module.exports = async function updateUserEmail({
  email,
  userId,
  authenticatedUserId,
  password,
  locale,
  userRepository,
  authenticationMethodRepository,
  encryptionService,
  mailService,
}) {
  if (userId !== authenticatedUserId) {
    throw new UserNotAuthorizedToUpdateEmailError();
  }

  const user = await userRepository.get(userId);
  if (!user.email) {
    throw new UserNotAuthorizedToUpdateEmailError();
  }

  const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId,
    identityProvider: AuthenticationMethod.identityProviders.PIX,
  });

  try {
    const passwordHash = authenticationMethod.authenticationComplement.password;

    await encryptionService.checkPassword({
      password,
      passwordHash,
    });
  } catch (e) {
    throw new InvalidPasswordForUpdateEmailError();
  }

  await userRepository.isEmailAvailable(email);
  await userRepository.updateEmail({ id: userId, email: email.toLowerCase() });
  await mailService.notifyEmailChange({ email, locale });
};
