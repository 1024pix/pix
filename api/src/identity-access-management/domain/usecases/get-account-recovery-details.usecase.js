import { AccountRecoveryService } from '../services/account-recovery.service.js';

/**
 * @param {{
 *   temporaryKey: string,
 *   accountRecoveryDemandRepository: AccountRecoveryDemandRepository,
 *   userRepository: UserRepository,
 *   authenticationMethodRepository: AuthenticationMethodRepository,
 * }} params
 * @return {Promise<{firstName: string, id: string, email: string, hasGarAuthenticationMethod: boolean, hasScoUsername: boolean}>}
 */
export const getAccountRecoveryDetails = async function ({
  temporaryKey,
  accountRecoveryDemandRepository,
  userRepository,
  authenticationMethodRepository,
}) {
  const recoveryDemandService = new AccountRecoveryService({ userRepository, accountRecoveryDemandRepository });

  const recoveryDemand = await recoveryDemandService.getRecoveryDemand(temporaryKey);
  const user = await userRepository.get(recoveryDemand.userId);

  const hasGarAuthenticationMethod = await authenticationMethodRepository.hasIdentityProviderGar({
    userId: recoveryDemand.userId,
  });

  return {
    id: recoveryDemand.id,
    email: recoveryDemand.newEmail,
    firstName: user.firstName,
    hasGarAuthenticationMethod,
    hasScoUsername: Boolean(user.username),
  };
};
