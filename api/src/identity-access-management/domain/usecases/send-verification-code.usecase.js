import lodash from 'lodash';

import {
  InvalidPasswordForUpdateEmailError,
  UserNotAuthorizedToUpdateEmailError,
} from '../../../shared/domain/errors.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';

const { get } = lodash;

/**
 * @param {Object} params
 *
 * @param {*} params.i18n
 * @param {*} params.locale
 * @param {string} params.newEmail
 * @param {string} params.password
 * @param {string} params.userId
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {UserEmailRepository} params.userEmailRepository
 * @param {UserRepository} params.userRepository
 * @param {CryptoService} params.cryptoService
 * @param {MailService} params.mailService
 * @param {*} params.codeUtils
 */

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
