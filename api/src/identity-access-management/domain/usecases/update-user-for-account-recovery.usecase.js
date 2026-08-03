import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import { AccountRecoveryService } from '../services/account-recovery.service.js';

/**
 * @param {{
 *   password: string,
 *   temporaryKey: string,
 *   accountRecoveryDemandRepository: AccountRecoveryDemandRepository,
 *   cryptoService: CryptoService,
 *   authenticationMethodRepository: AuthenticationMethodRepository,
 *   legalDocumentApiRepository, LegalDocumentApiRepository,
 *   userRepository: UserRepository,
 * }} params
 * @return {Promise<void>}
 */
export const updateUserForAccountRecovery = async function ({
  password,
  temporaryKey,
  accountRecoveryDemandRepository,
  cryptoService,
  authenticationMethodRepository,
  legalDocumentApiRepository,
  userRepository,
}) {
  const recoveryDemandService = new AccountRecoveryService({ userRepository, accountRecoveryDemandRepository });

  const { userId, newEmail } = await recoveryDemandService.getRecoveryDemand(temporaryKey);

  const hashedPassword = await cryptoService.hashPassword(password);

  const hasAnAuthenticationMethodFromPix = await authenticationMethodRepository.hasIdentityProviderPIX({ userId });
  if (hasAnAuthenticationMethodFromPix) {
    await authenticationMethodRepository.updatePassword({ userId, hashedPassword });
  } else {
    const authenticationMethodFromPix = new AuthenticationMethod({
      userId,
      identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
      authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
        password: hashedPassword,
        shouldChangePassword: false,
      }),
    });
    await authenticationMethodRepository.create({ authenticationMethod: authenticationMethodFromPix });
  }

  await authenticationMethodRepository.removeByUserIdAndIdentityProvider({
    userId,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
  });

  await legalDocumentApiRepository.acceptPixAppTos({ userId });

  await userRepository.updateWithEmailConfirmed({
    id: userId,
    userAttributes: {
      username: null,
      email: newEmail,
      emailConfirmedAt: new Date(),
    },
  });

  await accountRecoveryDemandRepository.markAsBeingUsed(temporaryKey);
};
