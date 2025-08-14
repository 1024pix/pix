import * as injectedOrganizationLearnerRepository from '../../../prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import { cryptoService } from '../../../shared/domain/services/crypto-service.js';
import { mailService as injectedMailService } from '../../../shared/domain/services/mail-service.js';
import * as injectedUserReconciliationService from '../../../shared/domain/services/user-reconciliation-service.js';
import { accountRecoveryDemandRepository as injectedAccountRecoveryDemandRepository } from '../../infrastructure/repositories/account-recovery-demand.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { AccountRecoveryDemand } from '../models/AccountRecoveryDemand.js';
import { scoAccountRecoveryService as injectedScoAccountRecoveryService } from '../services/sco-account-recovery.service.js';

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
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
  userRepository = injectedUserRepository,
  accountRecoveryDemandRepository = injectedAccountRecoveryDemandRepository,
  mailService = injectedMailService,
  scoAccountRecoveryService = injectedScoAccountRecoveryService,
  userReconciliationService = injectedUserReconciliationService,
} = {}) {
  const { email: newEmail } = studentInformation;
  let encodedTemporaryKey;
  if (temporaryKey) {
    encodedTemporaryKey = temporaryKey;
  } else {
    const randomBytesBuffer = await cryptoService.randomBytes(32);
    encodedTemporaryKey = randomBytesBuffer.toString('hex');
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
