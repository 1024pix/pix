import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** TODO
 * Internal API Needed For
 * campaignRepository.getByCode
 * groupRepository.findByOrganizationId
 */
import * as campaignRepository from '../../../../../src/prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as userReconciliationService from '../../../../../src/shared/domain/services/user-reconciliation-service.js';
import * as authenticationMethodRepository from '../../../../identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import { lastUserApplicationConnectionsRepository } from '../../../../identity-access-management/infrastructure/repositories/last-user-application-connections.repository.js';
import * as userRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { userToCreateRepository } from '../../../../identity-access-management/infrastructure/repositories/user-to-create.repository.js';
import * as organizationFeaturesAPI from '../../../../organizational-entities/application/api/organization-features-api.js';
import { tagRepository } from '../../../../organizational-entities/infrastructure/repositories/tag.repository.js';
import * as obfuscationService from '../../../../shared/domain/services/obfuscation-service.js';
import { tokenService } from '../../../../shared/domain/services/token-service.js';
import * as userService from '../../../../shared/domain/services/user-service.js';
import * as libOrganizationLearnerRepository from '../../../../shared/infrastructure/repositories/organization-learner-repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as userLoginRepository from '../../../../shared/infrastructure/repositories/user-login-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as divisionRepository from '../../../campaign/infrastructure/repositories/division-repository.js';
import * as groupRepository from '../../../campaign/infrastructure/repositories/group-repository.js';
import * as campaignParticipationOverviewRepository from '../../../campaign-participation/infrastructure/repositories/campaign-participation-overview-repository.js';
import * as organizationLearnerImportFormatRepository from '../../../learner-management/infrastructure/repositories/organization-learner-import-format-repository.js';
import * as prescriptionOrganizationLearnerRepository from '../../../learner-management/infrastructure/repositories/organization-learner-repository.js';
import * as studentRepository from '../../../learner-management/infrastructure/repositories/student-repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import * as organizationLearnerActivityRepository from '../../infrastructure/repositories/organization-learner-activity-repository.js';
import * as organizationLearnerFeatureRepository from '../../infrastructure/repositories/organization-learner-feature-repository.js';
import * as organizationParticipantRepository from '../../infrastructure/repositories/organization-participant-repository.js';
import * as registrationOrganizationLearnerRepository from '../../infrastructure/repositories/registration-organization-learner-repository.js';
import * as scoOrganizationParticipantRepository from '../../infrastructure/repositories/sco-organization-participant-repository.js';
import * as supOrganizationParticipantRepository from '../../infrastructure/repositories/sup-organization-participant-repository.js';

const dependencies = {
  analysisRepository: repositories.analysisRepository,
  divisionRepository,
  groupRepository,
  supOrganizationParticipantRepository,
  scoOrganizationParticipantRepository,
  libOrganizationLearnerRepository,
  organizationRepository,
  organizationParticipantRepository,
  organizationLearnerActivityRepository,
  organizationLearnerRepository: repositories.organizationLearnerRepository,
  organizationLearnerFeatureRepository,
  organizationLearnerImportFormatRepository,
  organizationFeaturesAPI,
  campaignRepository,
  campaignParticipationOverviewRepository,
  registrationOrganizationLearnerRepository,
  tagRepository,
  userService,
  userReconciliationService,
  authenticationMethodRepository,
  userRepository,
  lastUserApplicationConnectionsRepository,
  userToCreateRepository,
  userLoginRepository,
  prescriptionOrganizationLearnerRepository,
  studentRepository,
  obfuscationService,
  tokenService,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, './'),
    ignoredFileNames: ['index.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
