import lodash from 'lodash';

import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../src/identity-access-management/domain/constants/identity-providers.js';
import { InvalidPasswordForUpdateEmailError, UserNotAuthorizedToUpdateEmailError } from '../errors.js';

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
  cryptoService,
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
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
  });

  try {
    const passwordHash = get(authenticationMethod, 'authenticationComplement.password', '');

    await cryptoService.checkPassword({
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
