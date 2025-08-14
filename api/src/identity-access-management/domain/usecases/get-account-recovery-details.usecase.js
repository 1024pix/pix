import * as injectedPrescriptionOrganizationLearnerRepository from '../../../prescription/learner-management/infrastructure/repositories/organization-learner-repository.js';
import { accountRecoveryDemandRepository as injectedAccountRecoveryDemandRepository } from '../../infrastructure/repositories/account-recovery-demand.repository.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { scoAccountRecoveryService as injectedScoAccountRecoveryService } from '../services/sco-account-recovery.service.js'; /**
 * @param {{
 *   temporaryKey: string,
 *   accountRecoveryDemandRepository: AccountRecoveryDemandRepository,
 *   prescriptionOrganizationLearnerRepository: PrescriptionOrganizationLearnerRepository,
 *   userRepository: UserRepository,
 *   authenticationMethodRepository: AuthenticationMethodRepository,
 *   scoAccountRecoveryService: ScoAccountRecoveryService,
 * }} params
 * @return {Promise<{firstName: string, id: string, email: string, hasGarAuthenticationMethod: boolean, hasScoUsername: boolean}>}
 */
export const getAccountRecoveryDetails = async function ({
  temporaryKey,
  accountRecoveryDemandRepository = injectedAccountRecoveryDemandRepository,
  prescriptionOrganizationLearnerRepository = injectedPrescriptionOrganizationLearnerRepository,
  userRepository = injectedUserRepository,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
  scoAccountRecoveryService = injectedScoAccountRecoveryService,
} = {}) {
  const { id, userId, newEmail, organizationLearnerId } =
    await scoAccountRecoveryService.retrieveAndValidateAccountRecoveryDemand({
      temporaryKey,
      accountRecoveryDemandRepository,
      userRepository,
    });
  const hasGarAuthenticationMethod = await authenticationMethodRepository.hasIdentityProviderGar({ userId });
  const user = await userRepository.get(userId);
  const hasScoUsername = user.username ? true : false;
  const { firstName } = await prescriptionOrganizationLearnerRepository.getLearnerInfo(organizationLearnerId);

  return {
    id,
    email: newEmail,
    firstName,
    hasGarAuthenticationMethod,
    hasScoUsername,
  };
};
