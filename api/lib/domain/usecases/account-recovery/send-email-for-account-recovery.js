import crypto from 'crypto';
import { AccountRecoveryDemand } from '../../models/AccountRecoveryDemand.js';

const sendEmailForAccountRecovery = async function ({
  studentInformation,
  temporaryKey,
  organizationLearnerRepository,
  userRepository,
  accountRecoveryDemandRepository,
  mailService,
  scoAccountRecoveryService,
  userReconciliationService,
}) {
  const { email: newEmail } = studentInformation;
  const encodedTemporaryKey = temporaryKey || crypto.randomBytes(32).toString('hex');

  const {
    firstName,
    id,
    userId,
    email: oldEmail,
  } = await scoAccountRecoveryService.retrieveOrganizationLearner({
    studentInformation,
    accountRecoveryDemandRepository,
    organizationLearnerRepository,
    userRepository,
    userReconciliationService,
  });

  await userRepository.checkIfEmailIsAvailable(newEmail);

  const accountRecoveryDemand = new AccountRecoveryDemand({
    userId,
    organizationLearnerId: id,
    newEmail,
    oldEmail,
    used: false,
    temporaryKey: encodedTemporaryKey,
  });
  await accountRecoveryDemandRepository.save(accountRecoveryDemand);

  await mailService.sendAccountRecoveryEmail({
    firstName,
    email: newEmail,
    temporaryKey: encodedTemporaryKey,
  });
};

export { sendEmailForAccountRecovery };
