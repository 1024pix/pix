import { cryptoService as injectedCryptoService } from '../../../shared/domain/services/crypto-service.js';
import { accountRecoveryDemandRepository as injectedAccountRecoveryDemandRepository } from '../../infrastructure/repositories/account-recovery-demand.repository.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import { scoAccountRecoveryService as injectedScoAccountRecoveryService } from '../services/sco-account-recovery.service.js';

/**
 * @param {{
 *   password: string,
 *   temporaryKey: string,
 *   accountRecoveryDemandRepository: AccountRecoveryDemandRepository,
 *   authenticationMethodRepository: AuthenticationMethodRepository,
 *   userRepository: UserRepository,
 *   cryptoService: CryptoService,
 *   scoAccountRecoveryService: ScoAccountRecoveryService,
 * }} params
 * @return {Promise<void>}
 */
export const updateUserForAccountRecovery = async function ({
  password,
  temporaryKey,
  userRepository = injectedUserRepository,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
  accountRecoveryDemandRepository = injectedAccountRecoveryDemandRepository,
  scoAccountRecoveryService = injectedScoAccountRecoveryService,
  cryptoService = injectedCryptoService,
} = {}) {
  const { userId, newEmail } = await scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand({
    temporaryKey,
    accountRecoveryDemandRepository,
    userRepository,
  });
  const hashedPassword = await cryptoService.hashPassword(password);

  const hasAnAuthenticationMethodFromPix = await authenticationMethodRepository.hasIdentityProviderPIX({ userId });

  if (hasAnAuthenticationMethodFromPix) {
    await authenticationMethodRepository.updatePassword({
      userId,
      hashedPassword,
    });
  } else {
    const authenticationMethodFromPix = new AuthenticationMethod({
      userId,
      identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
      authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
        password: hashedPassword,
        shouldChangePassword: false,
      }),
    });
    await authenticationMethodRepository.create({
      authenticationMethod: authenticationMethodFromPix,
    });
  }

  const now = new Date();
  const userValuesToUpdate = {
    username: null,
    cgu: true,
    email: newEmail,
    emailConfirmedAt: now,
    lastTermsOfServiceValidatedAt: now,
  };
  await authenticationMethodRepository.removeByUserIdAndIdentityProvider({
    userId,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
  });

  await userRepository.updateWithEmailConfirmed({
    id: userId,
    userAttributes: userValuesToUpdate,
  });
  await accountRecoveryDemandRepository.markAsBeingUsed(temporaryKey);
};
