import * as injectedOrganizationLearnerRepository from '../../../prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import * as injectedUserReconciliationService from '../../../shared/domain/services/user-reconciliation-service.js';
import * as injectedOrganizationRepository from '../../../shared/infrastructure/repositories/organization-repository.js';
import { accountRecoveryDemandRepository as injectedAccountRecoveryDemandRepository } from '../../infrastructure/repositories/account-recovery-demand.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { StudentInformationForAccountRecovery } from '../read-models/StudentInformationForAccountRecovery.js';
import { scoAccountRecoveryService as injectedScoAccountRecoveryService } from '../services/sco-account-recovery.service.js';

const checkScoAccountRecovery = async function ({
  studentInformation,
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
  organizationRepository = injectedOrganizationRepository,
  accountRecoveryDemandRepository = injectedAccountRecoveryDemandRepository,
  userRepository = injectedUserRepository,
  scoAccountRecoveryService = injectedScoAccountRecoveryService,
  userReconciliationService = injectedUserReconciliationService,
} = {}) {
  const { firstName, lastName, username, organizationId, email } =
    await scoAccountRecoveryService.retrieveOrganizationLearner({
      studentInformation,
      accountRecoveryDemandRepository,
      organizationLearnerRepository,
      userRepository,
      userReconciliationService,
    });

  const { name: latestOrganizationName } = await organizationRepository.get(organizationId);

  return new StudentInformationForAccountRecovery({
    firstName,
    lastName,
    username,
    email,
    latestOrganizationName,
  });
};

export { checkScoAccountRecovery };
