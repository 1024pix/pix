// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable import/no-restricted-paths */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as certificationChallengeLiveAlertRepository from '../../../src/certification/shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationCompanionAlertRepository from '../../../src/certification/shared/infrastructure/repositories/certification-companion-alert-repository.js';
import * as algorithmDataFetcherService from '../../../src/evaluation/domain/services/algorithm-methods/data-fetcher.js';
import * as competenceEvaluationRepository from '../../../src/evaluation/infrastructure/repositories/competence-evaluation-repository.js';
import * as stageAcquisitionRepository from '../../../src/evaluation/infrastructure/repositories/stage-acquisition-repository.js';
import * as stageRepository from '../../../src/evaluation/infrastructure/repositories/stage-repository.js';
import { OidcAuthenticationServiceRegistry } from '../../../src/identity-access-management/domain/services/oidc-authentication-service-registry.js';
import * as passwordGenerator from '../../../src/identity-access-management/domain/services/password-generator.service.js';
import { pixAuthenticationService } from '../../../src/identity-access-management/domain/services/pix-authentication-service.js';
import { scoAccountRecoveryService } from '../../../src/identity-access-management/domain/services/sco-account-recovery.service.js';
import { accountRecoveryDemandRepository } from '../../../src/identity-access-management/infrastructure/repositories/account-recovery-demand.repository.js';
import * as authenticationMethodRepository from '../../../src/identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import { emailValidationDemandRepository } from '../../../src/identity-access-management/infrastructure/repositories/email-validation-demand.repository.js';
import { lastUserApplicationConnectionsRepository } from '../../../src/identity-access-management/infrastructure/repositories/last-user-application-connections.repository.js';
import * as oidcProviderRepository from '../../../src/identity-access-management/infrastructure/repositories/oidc-provider-repository.js';
import { organizationLearnerIdentityRepository } from '../../../src/identity-access-management/infrastructure/repositories/organization-learner-identity.repository.js';
import * as userRepository from '../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { userToCreateRepository } from '../../../src/identity-access-management/infrastructure/repositories/user-to-create.repository.js';
import * as dataProtectionOfficerRepository from '../../../src/organizational-entities/infrastructure/repositories/data-protection-officer.repository.js';
import { organizationForAdminRepository } from '../../../src/organizational-entities/infrastructure/repositories/organization-for-admin.repository.js';
import * as organizationTagRepository from '../../../src/organizational-entities/infrastructure/repositories/organization-tag.repository.js';
import { tagRepository } from '../../../src/organizational-entities/infrastructure/repositories/tag.repository.js';
import * as campaignRepository from '../../../src/prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as campaignParticipationRepository from '../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { participationCompletedJobRepository } from '../../../src/prescription/campaign-participation/infrastructure/repositories/jobs/participation-completed-job-repository.js';
import * as prescriptionOrganizationLearnerRepository from '../../../src/prescription/learner-management/infrastructure/repositories/organization-learner-repository.js';
import * as studentRepository from '../../../src/prescription/learner-management/infrastructure/repositories/student-repository.js';
import * as targetProfileSummaryForAdminRepository from '../../../src/prescription/target-profile/infrastructure/repositories/target-profile-summary-for-admin-repository.js';
import * as schoolRepository from '../../../src/school/infrastructure/repositories/school-repository.js';
import { config } from '../../../src/shared/config.js';
import * as codeGenerator from '../../../src/shared/domain/services/code-generator.js';
import { cryptoService } from '../../../src/shared/domain/services/crypto-service.js';
import * as obfuscationService from '../../../src/shared/domain/services/obfuscation-service.js';
import { tokenService } from '../../../src/shared/domain/services/token-service.js';
import * as userReconciliationService from '../../../src/shared/domain/services/user-reconciliation-service.js';
import * as userService from '../../../src/shared/domain/services/user-service.js';
import * as passwordValidator from '../../../src/shared/domain/validators/password-validator.js';
import * as userValidator from '../../../src/shared/domain/validators/user-validator.js';
import * as answerRepository from '../../../src/shared/infrastructure/repositories/answer-repository.js';
import * as areaRepository from '../../../src/shared/infrastructure/repositories/area-repository.js';
import * as assessmentRepository from '../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as challengeRepository from '../../../src/shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as courseRepository from '../../../src/shared/infrastructure/repositories/course-repository.js';
import * as frameworkRepository from '../../../src/shared/infrastructure/repositories/framework-repository.js';
import { repositories as sharedRepositories } from '../../../src/shared/infrastructure/repositories/index.js';
import * as organizationLearnerRepository from '../../../src/shared/infrastructure/repositories/organization-learner-repository.js';
import * as organizationRepository from '../../../src/shared/infrastructure/repositories/organization-repository.js';
import * as skillRepository from '../../../src/shared/infrastructure/repositories/skill-repository.js';
import * as thematicRepository from '../../../src/shared/infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../../../src/shared/infrastructure/repositories/tube-repository.js';
import * as userLoginRepository from '../../../src/shared/infrastructure/repositories/user-login-repository.js';
import * as writeCsvUtils from '../../../src/shared/infrastructure/utils/csv/write-csv-utils.js';
import { injectDependencies } from '../../../src/shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../src/shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as emailRepository from '../../../src/shared/mail/infrastructure/repositories/email.repository.js';
import { organizationInvitationService } from '../../../src/team/domain/services/organization-invitation.service.js';
import { certificationCenterMembershipRepository } from '../../../src/team/infrastructure/repositories/certification-center-membership.repository.js';
import * as membershipRepository from '../../../src/team/infrastructure/repositories/membership.repository.js';
import { organizationInvitationRepository } from '../../../src/team/infrastructure/repositories/organization-invitation.repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import { certificationCompletedJobRepository } from '../../infrastructure/repositories/jobs/certification-completed-job-repository.js';
import * as targetProfileShareRepository from '../../infrastructure/repositories/target-profile-share-repository.js';
import * as learningContentConversionService from '../services/learning-content/learning-content-conversion-service.js';
import * as organizationValidator from '../validators/organization-with-tags-and-target-profiles-script.js';

const oidcAuthenticationServiceRegistry = new OidcAuthenticationServiceRegistry({ oidcProviderRepository });

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {certificationBadgesService} CertificationBadgesService
 * @typedef {certificationCenterRepository} CertificationCenterRepository
 * @typedef {certificationRepository} CertificationRepository
 * @typedef {complementaryCertificationCourseRepository} ComplementaryCertificationCourseRepository
 * @typedef {finalizedSessionRepository} FinalizedSessionRepository
 * @typedef {mailService} MailService
 * @typedef {placementProfileService} PlacementProfileService
 * @typedef {sessionPublicationService} SessionPublicationService
 * @typedef {sessionRepository} SessionRepository
 * @typedef {certificationCenterForAdminRepository} CertificationCenterForAdminRepository
 * @typedef {certificationCompletedJobRepository} CertificationCompletedJobRepository
 * @typedef {complementaryCertificationHabilitationRepository} ComplementaryCertificationHabilitationRepository
 * @typedef {dataProtectionOfficerRepository} DataProtectionOfficerRepository
 * @typedef {userAnonymizedEventLoggingJobRepository} UserAnonymizedEventLoggingJobRepository
 * @typedef {certificationCandidateRepository} CertificationCandidateRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {userRepository} UserRepository
 * @typedef {certificationChallengesService} CertificationChallengesService
 * @typedef {assessmentRepository} AssessmentRepository
 * @typedef {LastUserApplicationConnectionsRepository} LastUserApplicationConnectionsRepository
 */
const dependencies = {
  accountRecoveryDemandRepository,
  certificationCompletedJobRepository,
  algorithmDataFetcherService,
  answerRepository,
  areaRepository,
  assessmentRepository,
  authenticationMethodRepository,
  participationCompletedJobRepository,
  campaignParticipationRepository,
  campaignRepository,
  certificationCenterMembershipRepository,
  certificationChallengeLiveAlertRepository,
  certificationCompanionAlertRepository,
  challengeRepository,
  codeGenerator,
  competenceEvaluationRepository,
  competenceRepository,
  config,
  correctionRepository: repositories.correctionRepository,
  courseRepository,
  cryptoService,
  dataProtectionOfficerRepository,
  emailRepository,
  emailValidationDemandRepository,
  frameworkRepository,
  userToCreateRepository,
  knowledgeElementRepository: sharedRepositories.knowledgeElementRepository,
  lastUserApplicationConnectionsRepository,
  learningContentConversionService,
  membershipRepository,
  obfuscationService,
  organizationForAdminRepository,
  organizationInvitationRepository,
  organizationInvitationService,
  organizationLearnerIdentityRepository,
  organizationLearnerRepository,
  organizationRepository,
  organizationTagRepository,
  organizationValidator,
  passwordGenerator,
  passwordValidator,
  pixAuthenticationService,
  prescriptionOrganizationLearnerRepository,
  schoolRepository,
  scoAccountRecoveryService,
  skillRepository,
  stageAcquisitionRepository,
  stageRepository,
  studentRepository,
  tagRepository,
  targetProfileShareRepository,
  targetProfileSummaryForAdminRepository,
  thematicRepository,
  tokenService,
  trainingRepository: repositories.trainingRepository,
  trainingTriggerRepository: repositories.trainingTriggerRepository,
  tubeRepository,
  tutorialEvaluationRepository: repositories.tutorialEvaluationRepository,
  tutorialRepository: repositories.tutorialRepository,
  userLoginRepository,
  userRecommendedTrainingRepository: repositories.userRecommendedTrainingRepository,
  userReconciliationService,
  userRepository,
  userService,
  userValidator,
  writeCsvUtils,
  oidcAuthenticationServiceRegistry,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { oidcAuthenticationServiceRegistry, usecases };
