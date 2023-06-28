import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import { InvalidPasswordForUpdateEmailError, UserNotAuthorizedToUpdateEmailError } from '../errors.js';
import lodash from 'lodash';

const { get } = lodash;

const sendVerificationCode = async function ({
  i18n,
  locale,
  newEmail,
  password,
  userId,
  authenticationMethodRepository,
  userEmailRepository,
  userRepository,
  encryptionService,
  mailService,
  codeUtils,
}) {
  const user = await userRepository.get(userId);
  if (!user.email) {
    throw new UserNotAuthorizedToUpdateEmailError();
  }

  await userRepository.checkIfEmailIsAvailable(newEmail);

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
  await mailService.sendVerificationCodeEmail({ code, locale, translate: i18n.__, email: newEmail });
};

export { sendVerificationCode };
