const codeUtils = require('../../infrastructure/utils/code-utils');
const AuthenticationMethod = require('../models/AuthenticationMethod');
const { InvalidPasswordForUpdateEmailError, UserNotAuthorizedToUpdateEmailError } = require('../errors');
const get = require('lodash/get');

module.exports = async function sendVerificationCode({
  locale,
  newEmail,
  password,
  userId,
  authenticationMethodRepository,
  userEmailRepository,
  userRepository,
  encryptionService,
  mailService,
}) {

  const user = await userRepository.get(userId);
  if (!user.email) {
    throw new UserNotAuthorizedToUpdateEmailError();
  }

  await userRepository.isEmailAvailable(newEmail);

  const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId,
    identityProvider: AuthenticationMethod.identityProviders.PIX,
  });

  try {
    const passwordHash = get(authenticationMethod, 'authenticationComplement.password', '');

    await encryptionService.checkPassword({
      password,
      passwordHash,
    });
  } catch (e) {
    throw new InvalidPasswordForUpdateEmailError();
  }

  const code = codeUtils.generateNumericalString(6);

  await userEmailRepository.saveEmailModificationDemand({ userId, code, newEmail });
  await mailService.sendVerificationCodeEmail({ code, locale, email: newEmail });
};
