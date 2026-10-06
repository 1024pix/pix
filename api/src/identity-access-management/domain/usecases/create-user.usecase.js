import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { createAccountCreationEmail } from '../emails/create-account-creation.email.js';

/**
 * @param {Object} params
 * @param {string} params.locale
 * @param {string} params.password
 * @param {import('../models/User.js').User} params.user
 * @param {string} params.redirectionUrl
 * @param {import('../../infrastructure/repositories/authentication-method.repository.js').AuthenticationMethodRepository} params.authenticationMethodRepository
 * @param {Object} params.campaignRepository
 * @param {import('../../infrastructure/repositories/user.repository.js')} params.userRepository
 * @param {import('../../infrastructure/repositories/user-to-create.repository.js')} params.userToCreateRepository
 * @param {import('../../../shared/domain/services/crypto-service.js')} params.cryptoService
 * @param {import('../services/user-service.js')} params.userService
 * @param {import('../../../shared/domain/validators/user-validator.js')} params.userValidator
 * @param {import('../../../shared/domain/validators/password-validator.js')} params.passwordValidator
 * @return {Promise<User|undefined>}
 */
export async function createUser({
  locale,
  password,
  user,
  redirectionUrl,
  authenticationMethodRepository,
  emailRepository,
  emailValidationDemandRepository,
  userRepository,
  userToCreateRepository,
  legalDocumentApiRepository,
  cryptoService,
  userService,
  userValidator,
  passwordValidator,
}) {
  const { savedUser, token } = await DomainTransaction.execute(async () => {
    await userService.validateUserWithPasswordForCreation({
      password,
      user,
      userRepository,
      userValidator,
      passwordValidator,
    });

    user.lastDataProtectionPolicySeenAt = new Date();

    const hashedPassword = await cryptoService.hashPassword(password);

    const savedUser = await userService.createUserWithPassword({
      user,
      locale,
      hashedPassword,
      userToCreateRepository,
      authenticationMethodRepository,
    });

    await legalDocumentApiRepository.acceptPixAppTos({ userId: savedUser.id });

    const token = await emailValidationDemandRepository.save(savedUser.id);

    return { savedUser, token };
  });

  await emailRepository.sendEmailAsync(
    createAccountCreationEmail({
      locale,
      email: savedUser.email,
      firstName: savedUser.firstName,
      token,
      redirectionUrl,
    }),
  );

  return savedUser;
}
