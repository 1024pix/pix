import lodash from 'lodash';

import {
  EntityValidationError,
  InvalidPasswordForUpdateEmailError,
  UserNotAuthorizedToUpdateEmailError,
} from '../../../shared/domain/errors.js';
import { cryptoService as injectedCryptoService } from '../../../shared/domain/services/crypto-service.js';
import { mailService as injectedMailService } from '../../../shared/domain/services/mail-service.js';
import * as injectedCodeUtils from '../../../shared/infrastructure/utils/code-utils.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { userEmailRepository as injectedUserEmailRepository } from '../../infrastructure/repositories/user-email.repository.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { InvalidOrAlreadyUsedEmailError } from '../errors.js';

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
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
  userEmailRepository = injectedUserEmailRepository,
  userRepository = injectedUserRepository,
  cryptoService = injectedCryptoService,
  mailService = injectedMailService,
  codeUtils = injectedCodeUtils,
} = {}) {
  const user = await userRepository.get(userId);
  if (!user.email) {
    throw new UserNotAuthorizedToUpdateEmailError();
  }

  try {
    await userRepository.checkIfEmailIsAvailable(newEmail);
  } catch (e) {
    _manageError(e, InvalidOrAlreadyUsedEmailError, 'email', 'INVALID_OR_ALREADY_USED_EMAIL');
  }

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
  } catch {
    throw new InvalidPasswordForUpdateEmailError();
  }

  const code = codeUtils.generateNumericalString(6);

  await userEmailRepository.saveEmailModificationDemand({ userId, code, newEmail });
  await mailService.sendVerificationCodeEmail({ code, locale, translate: i18n.__, email: newEmail });
};

function _manageError(error, errorType, attribute, message) {
  if (error instanceof errorType) {
    throw new EntityValidationError({
      invalidAttributes: [{ attribute, message }],
    });
  }
  throw error;
}

export { sendVerificationCode };
