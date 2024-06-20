import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';

/**
 * @param {{
 *   password: string,
 *   temporaryKey: string,
 *   accountRecoveryDemandRepository: AccountRecoveryDemandRepository,
 *   authenticationMethodRepository: AuthenticationMethodRepository,
 *   userRepository: UserRepository,
 *   cryptoService: CryptoService,
 *   scoAccountRecoveryService: ScoAccountRecoveryService,
 *   domainTransaction: DomainTransaction,
 * }} params
 * @return {Promise<void>}
 */
export const updateUserForAccountRecovery = async function ({
  password,
  temporaryKey,
  userRepository,
  domainTransaction,
  authenticationMethodRepository,
  accountRecoveryDemandRepository,
  scoAccountRecoveryService,
  cryptoService,
}) {
  const { userId, newEmail } = await scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand({
    temporaryKey,
    accountRecoveryDemandRepository,
    userRepository,
  });
  const hashedPassword = await cryptoService.hashPassword(password);

  const hasAnAuthenticationMethodFromPix = await authenticationMethodRepository.hasIdentityProviderPIX({ userId });

  if (hasAnAuthenticationMethodFromPix) {
    await authenticationMethodRepository.updateChangedPassword(
      {
        userId,
        hashedPassword,
      },
      domainTransaction,
    );
  } else {
    const authenticationMethodFromPix = new AuthenticationMethod({
      userId,
      identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
      authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
        password: hashedPassword,
        shouldChangePassword: false,
      }),
    });
    await authenticationMethodRepository.create(
      {
        authenticationMethod: authenticationMethodFromPix,
      },
      domainTransaction,
    );
  }

  const now = new Date();
  const userValuesToUpdate = {
    cgu: true,
    email: newEmail,
    emailConfirmedAt: now,
    lastTermsOfServiceValidatedAt: now,
  };

  await userRepository.updateWithEmailConfirmed({
    id: userId,
    userAttributes: userValuesToUpdate,
    domainTransaction,
  });
  await accountRecoveryDemandRepository.markAsBeingUsed(temporaryKey, domainTransaction);
};
