import { AccountRecoveryService } from '../../../../identity-access-management/domain/services/account-recovery.service.js';

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

  // bounded-context: must be exposed as an api from the identity-access-management bounded-context
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
