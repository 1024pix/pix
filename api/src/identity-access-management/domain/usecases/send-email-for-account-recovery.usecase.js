import crypto from 'node:crypto';
import util from 'node:util';

import { AccountRecoveryDemand } from '../models/AccountRecoveryDemand.js';

const randomBytes = util.promisify(crypto.randomBytes);

/**
 * @param {{
 *   studentInformation: Object,
 *   temporaryKey: string,
 *   accountRecoveryDemandRepository: AccountRecoveryDemandRepository,
 *   organizationLearnerRepository: OrganizationLearnerRepository,
 *   userRepository: UserRepository,
 *   mailService: MailService,
 *   scoAccountRecoveryService: ScoAccountRecoveryService,
 *   userReconciliationService: UserReconciliationService,
 * }} params
 * @return {Promise<void>}
 */
export const sendEmailForAccountRecovery = async function ({
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
  let encodedTemporaryKey;
  if (temporaryKey) {
    encodedTemporaryKey = temporaryKey;
  } else {
    const bufferRandomBytes = await randomBytes(32);
    encodedTemporaryKey = bufferRandomBytes.toString('hex');
  }

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
