import * as passwordGenerator from '../../../../identity-access-management/domain/services/password-generator.service.js';
import * as authenticationMethodRepository from '../../../../identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import { emailValidationDemandRepository } from '../../../../identity-access-management/infrastructure/repositories/email-validation-demand.repository.js';
import { lastUserApplicationConnectionsRepository } from '../../../../identity-access-management/infrastructure/repositories/last-user-application-connections.repository.js';
import { organizationLearnerIdentityRepository } from '../../../../identity-access-management/infrastructure/repositories/organization-learner-identity.repository.js';
import * as userRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { userToCreateRepository } from '../../../../identity-access-management/infrastructure/repositories/user-to-create.repository.js';
import * as organizationFeaturesAPI from '../../../../organizational-entities/application/api/organization-features-api.js';
import { tagRepository } from '../../../../organizational-entities/infrastructure/repositories/tag.repository.js';
import * as libOrganizationLearnerRepository from '../../../../prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js';
import * as combinedCourseRepository from '../../../../quest/infrastructure/repositories/combined-course-repository.js';
import * as questRepository from '../../../../quest/infrastructure/repositories/quest-repository.js';
import { cryptoService } from '../../../../shared/domain/services/crypto-service.js';
import * as obfuscationService from '../../../../shared/domain/services/obfuscation-service.js';
import { tokenService } from '../../../../shared/domain/services/token-service.js';
import * as userReconciliationService from '../../../../shared/domain/services/user-reconciliation-service.js';
import * as userService from '../../../../shared/domain/services/user-service.js';
/** TODO
 * Internal API Needed For
 * campaignRepository.getByCode
 * groupRepository.findByOrganizationId
 * combinedCourseRepository.getByCode
 */
import * as passwordValidator from '../../../../shared/domain/validators/password-validator.js';
import * as userValidator from '../../../../shared/domain/validators/user-validator.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import * as userLoginRepository from '../../../../shared/infrastructure/repositories/user-login-repository.js';
import * as writeCsvUtils from '../../../../shared/infrastructure/utils/csv/write-csv-utils.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as emailRepository from '../../../../shared/mail/infrastructure/repositories/email.repository.js';
import * as campaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as divisionRepository from '../../../campaign/infrastructure/repositories/division-repository.js';
import * as groupRepository from '../../../campaign/infrastructure/repositories/group-repository.js';
import * as campaignParticipationOverviewRepository from '../../../campaign-participation/infrastructure/repositories/campaign-participation-overview-repository.js';
import * as organizationLearnerImportFormatRepository from '../../../learner-management/infrastructure/repositories/organization-learner-import-format-repository.js';
import * as prescriptionOrganizationLearnerRepository from '../../../learner-management/infrastructure/repositories/organization-learner-repository.js';
import * as studentRepository from '../../../learner-management/infrastructure/repositories/student-repository.js';
import * as analysisRepository from '../../infrastructure/repositories/analysis-repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import * as organizationLearnerActivityRepository from '../../infrastructure/repositories/organization-learner-activity-repository.js';
import * as organizationLearnerFeatureRepository from '../../infrastructure/repositories/organization-learner-feature-repository.js';
import * as organizationParticipantRepository from '../../infrastructure/repositories/organization-participant-repository.js';
import * as registrationOrganizationLearnerRepository from '../../infrastructure/repositories/registration-organization-learner-repository.js';
import * as scoOrganizationParticipantRepository from '../../infrastructure/repositories/sco-organization-participant-repository.js';
import * as supOrganizationParticipantRepository from '../../infrastructure/repositories/sup-organization-participant-repository.js';

const dependencies = {
  analysisRepository,
  divisionRepository,
  cryptoService,
  emailValidationDemandRepository,
  emailRepository,
  userValidator,
  groupRepository,
  supOrganizationParticipantRepository,
  scoOrganizationParticipantRepository,
  libOrganizationLearnerRepository,
  organizationRepository,
  organizationParticipantRepository,
  organizationLearnerActivityRepository,
  organizationLearnerRepository: repositories.organizationLearnerRepository,
  organizationToJoinRepository: repositories.organizationToJoinRepository,
  organizationLearnerFeatureRepository,
  organizationLearnerIdentityRepository,
  organizationLearnerImportFormatRepository,
  organizationFeaturesAPI,
  passwordGenerator,
  campaignRepository,
  campaignParticipationOverviewRepository,
  registrationOrganizationLearnerRepository,
  questRepository,
  combinedCourseRepository,
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
  passwordValidator,
  writeCsvUtils,
};

import { getCampaignParticipationStatistics } from '../../../campaign-participation/domain/usecases/get-campaign-participation-statistics.js';
import { createAndReconcileUserToOrganizationLearner } from './create-and-reconcile-user-to-organization-learner.js';
import { createUserAndReconcileToOrganizationLearnerFromExternalUser } from './create-user-and-reconcile-to-organization-learner-from-external-user.js';
import { findAssociationBetweenUserAndOrganizationLearner } from './find-association-between-user-and-organization-learner.js';
import { findDivisionsByOrganization } from './find-divisions-by-organization.js';
import { findGroupsByOrganization } from './find-groups-by-organization.js';
import { findPaginatedFilteredAttestationParticipantsStatus } from './find-paginated-filtered-attestation-participants-status.js';
import { findPaginatedFilteredParticipants } from './find-paginated-filtered-participants.js';
import { findPaginatedFilteredScoParticipants } from './find-paginated-filtered-sco-participants.js';
import { findPaginatedFilteredSupParticipants } from './find-paginated-filtered-sup-participants.js';
import { findPaginatedOrganizationLearners } from './find-paginated-organization-learners.js';
import { generateOrganizationLearnersUsernameAndTemporaryPassword } from './generate-organization-learners-username-and-temporary-password.js';
import { generateResetOrganizationLearnersPasswordCsvContent } from './generate-reset-organization-learners-password-cvs-content.js';
import { generateUsername } from './generate-username.js';
import { generateUsernameWithTemporaryPassword } from './generate-username-with-temporary-password.js';
import { getAnalysisByTubes } from './get-analysis-by-tubes.js';
import { getAttestationZipForDivisions } from './get-attestation-zip-for-divisions.js';
import { getOrganizationLearner } from './get-organization-learner.js';
import { getOrganizationLearnerActivity } from './get-organization-learner-activity.js';
import { getOrganizationToJoin } from './get-organization-to-join.js';
import { updateOrganizationLearnerDependentUserPassword } from './update-organization-learner-dependent-user-password.js';

const usecasesWithoutInjectedDependencies = {
  createAndReconcileUserToOrganizationLearner,
  createUserAndReconcileToOrganizationLearnerFromExternalUser,
  findAssociationBetweenUserAndOrganizationLearner,
  findDivisionsByOrganization,
  findGroupsByOrganization,
  findPaginatedFilteredAttestationParticipantsStatus,
  findPaginatedFilteredParticipants,
  findPaginatedFilteredScoParticipants,
  findPaginatedFilteredSupParticipants,
  findPaginatedOrganizationLearners,
  generateOrganizationLearnersUsernameAndTemporaryPassword,
  generateResetOrganizationLearnersPasswordCsvContent,
  generateUsername,
  generateUsernameWithTemporaryPassword,
  getAnalysisByTubes,
  getAttestationZipForDivisions,
  getOrganizationLearner,
  getOrganizationLearnerActivity,
  getOrganizationLearnerStatistics: getCampaignParticipationStatistics,
  getOrganizationToJoin,
  updateOrganizationLearnerDependentUserPassword,
};
const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
