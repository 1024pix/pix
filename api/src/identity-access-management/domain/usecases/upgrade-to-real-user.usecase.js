import { AlreadyRegisteredEmailError } from '../../../../src/shared/domain/errors.js';
import { UnauthorizedError } from '../../../shared/application/http-errors.js';
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { cryptoService as injectedCryptoService } from '../../../shared/domain/services/crypto-service.js';
import * as injectedEmailRepository from '../../../shared/mail/infrastructure/repositories/email.repository.js';
import { anonymousUserTokenRepository as injectedAnonymousUserTokenRepository } from '../../infrastructure/repositories/anonymous-user-token.repository.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import { emailValidationDemandRepository as injectedEmailValidationDemandRepository } from '../../infrastructure/repositories/email-validation-demand.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { createAccountCreationEmail } from '../emails/create-account-creation.email.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';

const upgradeToRealUser = withTransaction(async function ({
  userId,
  userAttributes,
  password,
  anonymousUserToken,
  language,
  anonymousUserTokenRepository = injectedAnonymousUserTokenRepository,
  userRepository = injectedUserRepository,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
  emailValidationDemandRepository = injectedEmailValidationDemandRepository,
  emailRepository = injectedEmailRepository,
  cryptoService = injectedCryptoService,
} = {}) {
  const anonymousUser = await userRepository.getFullById(userId);
  if (!anonymousUser.isAnonymous) {
    throw new UnauthorizedError('User must be anonymous', 'NOT_ANONYMOUS_USER');
  }

  const existingUsersWithEmail = await userRepository.findAnotherUserByEmail(userId, userAttributes.email);
  if (existingUsersWithEmail.length > 0) {
    throw new AlreadyRegisteredEmailError();
  }

  const storedAnonymousUserToken = await anonymousUserTokenRepository.find(userId);
  if (storedAnonymousUserToken !== anonymousUserToken) {
    throw new UnauthorizedError('Anonymous token is invalid', 'INVALID_ANONYMOUS_TOKEN');
  }

  const realUser = anonymousUser.convertAnonymousToRealUser(userAttributes);
  await userRepository.update(realUser.mapToDatabaseDto());

  const hashedPassword = await cryptoService.hashPassword(password);
  const authenticationMethod = new AuthenticationMethod({
    userId,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password: hashedPassword,
      shouldChangePassword: false,
    }),
  });
  await authenticationMethodRepository.create({ authenticationMethod });

  const token = await emailValidationDemandRepository.save(realUser.id);
  await emailRepository.sendEmailAsync(
    createAccountCreationEmail({
      locale: language,
      email: realUser.email,
      firstName: realUser.firstName,
      token,
    }),
  );
  return realUser;
});

export { upgradeToRealUser };
