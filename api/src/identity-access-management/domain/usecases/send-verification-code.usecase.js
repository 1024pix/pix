import {
  EntityValidationError,
  InvalidPasswordForUpdateEmailError,
  UserNotAuthorizedToUpdateEmailError,
} from '../../../shared/domain/errors.js';
import { generateCode } from '../../../shared/infrastructure/utils/code-generator.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { emailChangeVerificationCodeEmail } from '../emails/email-change-verification-code.email.js';
import { InvalidOrAlreadyUsedEmailError } from '../errors.js';

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.action
 * @param {string} params.newEmail
 * @param {string} params.password
 * @param {*} params.locale
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {UserEmailRepository} params.userEmailRepository
 * @param {UserRepository} params.userRepository
 * @param {EmailRepository} params.emailRepository
 * @param {CryptoService} params.cryptoService
 */
const sendVerificationCode = async function ({
  userId,
  action,
  newEmail,
  password,
  locale,
  authenticationMethodRepository,
  userRepository,
  userEmailRepository,
  emailRepository,
  cryptoService,
}) {
  const user = await userRepository.get(userId);

  const code = generateCode(6, 'numericSafe');

  if (!action || action === 'update-email') {
    await _saveCodeForEmailUpdate({
      user,
      code,
      newEmail,
      password,
      authenticationMethodRepository,
      userRepository,
      userEmailRepository,
      cryptoService,
    });
  } else if (action === 'add-email') {
    await _saveCodeForEmailCreation({
      user,
      code,
      newEmail,
      password,
      userRepository,
      userEmailRepository,
      cryptoService,
    });
  }

  const email = emailChangeVerificationCodeEmail({ email: newEmail, code, locale });
  await emailRepository.sendEmailAsync(email);
};

async function _saveCodeForEmailUpdate({
  user,
  code,
  newEmail,
  password,
  authenticationMethodRepository,
  userRepository,
  userEmailRepository,
  cryptoService,
}) {
  if (!user.email) throw new UserNotAuthorizedToUpdateEmailError();

  try {
    await userRepository.checkIfEmailIsAvailable(newEmail);
  } catch (e) {
    _manageError(e, InvalidOrAlreadyUsedEmailError, 'email', 'INVALID_OR_ALREADY_USED_EMAIL');
  }

  const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId: user.id,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
  });

  try {
    const passwordHash = authenticationMethod?.authenticationComplement?.password;
    await cryptoService.checkPassword({ password, passwordHash });
  } catch {
    throw new InvalidPasswordForUpdateEmailError();
  }

  await userEmailRepository.saveEmailModificationDemand({ userId: user.id, action: 'update-email', code, newEmail });
}

async function _saveCodeForEmailCreation({
  user,
  code,
  newEmail,
  password,
  userRepository,
  userEmailRepository,
  cryptoService,
}) {
  if (user.email) throw new UserNotAuthorizedToUpdateEmailError();

  try {
    await userRepository.checkIfEmailIsAvailable(newEmail);
  } catch (e) {
    _manageError(e, InvalidOrAlreadyUsedEmailError, 'email', 'INVALID_OR_ALREADY_USED_EMAIL');
  }

  const passwordHash = await cryptoService.hashPassword(password);

  await userEmailRepository.saveEmailModificationDemand({
    userId: user.id,
    action: 'add-email',
    code,
    newEmail,
    passwordHash,
  });
}

function _manageError(error, errorType, attribute, message) {
  if (error instanceof errorType) {
    throw new EntityValidationError({ invalidAttributes: [{ attribute, message }] });
  }
  throw error;
}

export { sendVerificationCode };
