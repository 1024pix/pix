import { AccountRecoveryService } from '../services/account-recovery.service.js';

/**
 * @param {{
 *   studentInformation: Object,
 *   organizationLearnerRepository: OrganizationLearnerRepository,
 *   userReconciliationService: UserReconciliationService,
 *   userRepository: UserRepository,
 *   accountRecoveryDemandRepository: AccountRecoveryDemandRepository,
 *   scoAccountRecoveryService: ScoAccountRecoveryService,
 *   mailService: MailService,
 *   cryptoService: CryptoService,
 * }} params
 * @return {Promise<void>}
 */
export const sendEmailForAccountRecovery = async function ({
  studentInformation,
  organizationLearnerRepository,
  userReconciliationService,
  userRepository,
  accountRecoveryDemandRepository,
  scoAccountRecoveryService,
  mailService,
  cryptoService,
}) {
  const organizationLearner = await scoAccountRecoveryService.retrieveOrganizationLearner({
    studentInformation,
    organizationLearnerRepository,
    userReconciliationService,
  });

  const accountRecoveryService = new AccountRecoveryService({
    userRepository,
    accountRecoveryDemandRepository,
    cryptoService,
  });

  const recoveryDemand = await accountRecoveryService.createRecoveryDemand({
    userId: organizationLearner.userId,
    newEmail: studentInformation.email,
    organizationLearnerId: organizationLearner.id,
  });

  await mailService.sendAccountRecoveryEmail({
    firstName: organizationLearner.firstName,
    email: studentInformation.email,
    temporaryKey: recoveryDemand.temporaryKey,
  });
};
