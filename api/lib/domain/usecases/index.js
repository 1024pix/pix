// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable import/no-restricted-paths */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Not used in lib
import * as complementaryCertificationRepository from '../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-repository.js';
// Not used in lib
import * as sessionCodeService from '../../../src/certification/enrolment/domain/services/session-code-service.js';
// Not used in lib
import * as centerRepository from '../../../src/certification/enrolment/infrastructure/repositories/center-repository.js';
// Not used in lib
import * as certificationCpfCityRepository from '../../../src/certification/enrolment/infrastructure/repositories/certification-cpf-city-repository.js';
// Not used in lib
import * as sessionEnrolmentRepository from '../../../src/certification/enrolment/infrastructure/repositories/session-repository.js';
import * as certificationEvaluationCandidateRepository from '../../../src/certification/evaluation/infrastructure/repositories/certification-candidate-repository.js';
import * as flashAlgorithmService from '../../../src/certification/flash-certification/domain/services/algorithm-methods/flash.js';
// Not used in lib
import * as sessionPublicationService from '../../../src/certification/session-management/domain/services/session-publication-service.js';
// Not used in lib
import * as certificationOfficerRepository from '../../../src/certification/session-management/infrastructure/repositories/certification-officer-repository.js';
import * as finalizedSessionRepository from '../../../src/certification/session-management/infrastructure/repositories/finalized-session-repository.js';
// Not used in lib
import * as juryCertificationRepository from '../../../src/certification/session-management/infrastructure/repositories/jury-certification-repository.js';
import * as juryCertificationSummaryRepository from '../../../src/certification/session-management/infrastructure/repositories/jury-certification-summary-repository.js';
// Not used in lib
import * as jurySessionRepository from '../../../src/certification/session-management/infrastructure/repositories/jury-session-repository.js';
// Not used in lib
import * as sessionRepository from '../../../src/certification/session-management/infrastructure/repositories/session-repository.js';
// Not used in lib
import * as sessionSummaryRepository from '../../../src/certification/session-management/infrastructure/repositories/session-summary-repository.js';
import * as supervisorAccessRepository from '../../../src/certification/session-management/infrastructure/repositories/supervisor-access-repository.js';
// Not used in lib
import * as certificationBadgesService from '../../../src/certification/shared/domain/services/certification-badges-service.js';
import * as scoringCertificationService from '../../../src/certification/shared/domain/services/scoring-certification-service.js';
import * as certificationAssessmentRepository from '../../../src/certification/shared/infrastructure/repositories/certification-assessment-repository.js';
// Not used in lib
import * as certificationCandidateRepository from '../../../src/certification/shared/infrastructure/repositories/certification-candidate-repository.js';
import * as certificationCenterRepository from '../../../src/certification/shared/infrastructure/repositories/certification-center-repository.js';
import * as certificationChallengeLiveAlertRepository from '../../../src/certification/shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
// Not used in lib
import * as certificationChallengeRepository from '../../../src/certification/shared/infrastructure/repositories/certification-challenge-repository.js';
import * as certificationCompanionAlertRepository from '../../../src/certification/shared/infrastructure/repositories/certification-companion-alert-repository.js';
import * as certificationCourseRepository from '../../../src/certification/shared/infrastructure/repositories/certification-course-repository.js';
import * as flashAlgorithmConfigurationRepository from '../../../src/certification/shared/infrastructure/repositories/flash-algorithm-configuration-repository.js';
// Not used in lib
import * as issueReportCategoryRepository from '../../../src/certification/shared/infrastructure/repositories/issue-report-category-repository.js';
// Not used in lib
import * as sharedSessionRepository from '../../../src/certification/shared/infrastructure/repositories/session-repository.js';
// Not used in lib
import * as userSavedTutorialRepository from '../../../src/devcomp/infrastructure/repositories/user-saved-tutorial-repository.js';
import * as algorithmDataFetcherService from '../../../src/evaluation/domain/services/algorithm-methods/data-fetcher.js';
import * as smartRandom from '../../../src/evaluation/domain/services/algorithm-methods/smart-random.js';
// Not used in lib
import { getCompetenceLevel } from '../../../src/evaluation/domain/services/get-competence-level.js';
// Not used in lib
import * as improvementService from '../../../src/evaluation/domain/services/improvement-service.js';
import { pickChallengeService } from '../../../src/evaluation/domain/services/pick-challenge-service.js';
import * as scorecardService from '../../../src/evaluation/domain/services/scorecard-service.js';
// Not used in lib
import * as stageAndStageAcquisitionComparisonService from '../../../src/evaluation/domain/services/stages/stage-and-stage-acquisition-comparison-service.js';
import { answerJobRepository } from '../../../src/evaluation/infrastructure/repositories/answer-job-repository.js';
// Not used in lib
import * as badgeCriteriaRepository from '../../../src/evaluation/infrastructure/repositories/badge-criteria-repository.js';
// Not used in lib
import * as badgeRepository from '../../../src/evaluation/infrastructure/repositories/badge-repository.js';
import * as competenceEvaluationRepository from '../../../src/evaluation/infrastructure/repositories/competence-evaluation-repository.js';
import * as stageAcquisitionRepository from '../../../src/evaluation/infrastructure/repositories/stage-acquisition-repository.js';
// Not used in lib
import * as stageCollectionForTargetProfileRepository from '../../../src/evaluation/infrastructure/repositories/stage-collection-repository.js';
import * as stageRepository from '../../../src/evaluation/infrastructure/repositories/stage-repository.js';
// Not used in lib
import { authenticationSessionService } from '../../../src/identity-access-management/domain/services/authentication-session.service.js';
// Not used in lib
import { OidcAuthenticationServiceRegistry } from '../../../src/identity-access-management/domain/services/oidc-authentication-service-registry.js';
import * as passwordGenerator from '../../../src/identity-access-management/domain/services/password-generator.service.js';
import { pixAuthenticationService } from '../../../src/identity-access-management/domain/services/pix-authentication-service.js';
// Not used in lib
import * as resetPasswordService from '../../../src/identity-access-management/domain/services/reset-password.service.js';
import { scoAccountRecoveryService } from '../../../src/identity-access-management/domain/services/sco-account-recovery.service.js';
import { accountRecoveryDemandRepository } from '../../../src/identity-access-management/infrastructure/repositories/account-recovery-demand.repository.js';
import * as authenticationMethodRepository from '../../../src/identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import { emailValidationDemandRepository } from '../../../src/identity-access-management/infrastructure/repositories/email-validation-demand.repository.js';
// Not used in lib
import { userAnonymizedEventLoggingJobRepository } from '../../../src/identity-access-management/infrastructure/repositories/jobs/user-anonymized-event-logging-job-repository.js';
// Not used in lib
import * as oidcProviderRepository from '../../../src/identity-access-management/infrastructure/repositories/oidc-provider-repository.js';
import { organizationLearnerIdentityRepository } from '../../../src/identity-access-management/infrastructure/repositories/organization-learner-identity.repository.js';
// Not used in lib
import { refreshTokenRepository } from '../../../src/identity-access-management/infrastructure/repositories/refresh-token.repository.js';
// Not used in lib
import { resetPasswordDemandRepository } from '../../../src/identity-access-management/infrastructure/repositories/reset-password-demand.repository.js';
import * as userRepository from '../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
// Not used in lib
import { userEmailRepository } from '../../../src/identity-access-management/infrastructure/repositories/user-email.repository.js';
import { userToCreateRepository } from '../../../src/identity-access-management/infrastructure/repositories/user-to-create.repository.js';
// Not used in lib
import * as certificationCenterForAdminRepository from '../../../src/organizational-entities/infrastructure/repositories/certification-center-for-admin.repository.js';
// Not used in lib
import * as complementaryCertificationHabilitationRepository from '../../../src/organizational-entities/infrastructure/repositories/complementary-certification-habilitation.repository.js';
import * as dataProtectionOfficerRepository from '../../../src/organizational-entities/infrastructure/repositories/data-protection-officer.repository.js';
import { organizationForAdminRepository } from '../../../src/organizational-entities/infrastructure/repositories/organization-for-admin.repository.js';
import * as organizationTagRepository from '../../../src/organizational-entities/infrastructure/repositories/organization-tag.repository.js';
import { tagRepository } from '../../../src/organizational-entities/infrastructure/repositories/tag.repository.js';
import * as campaignRepository from '../../../src/prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as campaignParticipationRepository from '../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { participationCompletedJobRepository } from '../../../src/prescription/campaign-participation/infrastructure/repositories/jobs/participation-completed-job-repository.js';
import * as prescriptionOrganizationLearnerRepository from '../../../src/prescription/learner-management/infrastructure/repositories/organization-learner-repository.js';
import * as studentRepository from '../../../src/prescription/learner-management/infrastructure/repositories/student-repository.js';
import * as targetProfileRepository from '../../../src/prescription/target-profile/infrastructure/repositories/target-profile-repository.js';
import * as targetProfileSummaryForAdminRepository from '../../../src/prescription/target-profile/infrastructure/repositories/target-profile-summary-for-admin-repository.js';
// Not used in lib
import * as activityAnswerRepository from '../../../src/school/infrastructure/repositories/activity-answer-repository.js';
// Not used in lib
import * as missionRepository from '../../../src/school/infrastructure/repositories/mission-repository.js';
import * as schoolRepository from '../../../src/school/infrastructure/repositories/school-repository.js';
import { config } from '../../../src/shared/config.js';
import * as codeGenerator from '../../../src/shared/domain/services/code-generator.js';
import { cryptoService } from '../../../src/shared/domain/services/crypto-service.js';
// Not used in lib
import * as languageService from '../../../src/shared/domain/services/language-service.js';
// Not used in lib
import * as localeService from '../../../src/shared/domain/services/locale-service.js';
// Not used in lib
import * as mailService from '../../../src/shared/domain/services/mail-service.js';
// Not used in lib
import * as placementProfileService from '../../../src/shared/domain/services/placement-profile-service.js';
import { tokenService } from '../../../src/shared/domain/services/token-service.js';
import * as userService from '../../../src/shared/domain/services/user-service.js';
import * as passwordValidator from '../../../src/shared/domain/validators/password-validator.js';
import * as userValidator from '../../../src/shared/domain/validators/user-validator.js';
// Not used in lib
import { adminMemberRepository } from '../../../src/shared/infrastructure/repositories/admin-member.repository.js';
import * as answerRepository from '../../../src/shared/infrastructure/repositories/answer-repository.js';
import * as areaRepository from '../../../src/shared/infrastructure/repositories/area-repository.js';
import * as assessmentRepository from '../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as assessmentResultRepository from '../../../src/shared/infrastructure/repositories/assessment-result-repository.js';
import * as challengeRepository from '../../../src/shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as courseRepository from '../../../src/shared/infrastructure/repositories/course-repository.js';
import * as knowledgeElementRepository from '../../../src/shared/infrastructure/repositories/knowledge-element-repository.js';
import * as organizationLearnerRepository from '../../../src/shared/infrastructure/repositories/organization-learner-repository.js';
import * as organizationRepository from '../../../src/shared/infrastructure/repositories/organization-repository.js';
import * as skillRepository from '../../../src/shared/infrastructure/repositories/skill-repository.js';
import * as tubeRepository from '../../../src/shared/infrastructure/repositories/tube-repository.js';
import * as userLoginRepository from '../../../src/shared/infrastructure/repositories/user-login-repository.js';
// Not used in lib
import * as codeUtils from '../../../src/shared/infrastructure/utils/code-utils.js';
import * as writeCsvUtils from '../../../src/shared/infrastructure/utils/csv/write-csv-utils.js';
import * as dateUtils from '../../../src/shared/infrastructure/utils/date-utils.js';
import { injectDependencies } from '../../../src/shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../src/shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as emailRepository from '../../../src/shared/mail/infrastructure/repositories/email.repository.js';
import * as certificationCenterInvitationService from '../../../src/team/domain/services/certification-center-invitation-service.js';
import { organizationInvitationService } from '../../../src/team/domain/services/organization-invitation.service.js';
import * as certificationCenterInvitationRepository from '../../../src/team/infrastructure/repositories/certification-center-invitation-repository.js';
// Not used in lib
import { certificationCenterInvitedUserRepository } from '../../../src/team/infrastructure/repositories/certification-center-invited-user.repository.js';
import { certificationCenterMembershipRepository } from '../../../src/team/infrastructure/repositories/certification-center-membership.repository.js';
import * as membershipRepository from '../../../src/team/infrastructure/repositories/membership.repository.js';
import { organizationInvitationRepository } from '../../../src/team/infrastructure/repositories/organization-invitation.repository.js';
// Not used in lib
import { userOrgaSettingsRepository } from '../../../src/team/infrastructure/repositories/user-orga-settings-repository.js';
import * as obfuscationService from '../../domain/services/obfuscation-service.js';
import * as badgeAcquisitionRepository from '../../infrastructure/repositories/badge-acquisition-repository.js';
import * as badgeForCalculationRepository from '../../infrastructure/repositories/badge-for-calculation-repository.js';
import * as complementaryCertificationCourseResultRepository from '../../infrastructure/repositories/complementary-certification-course-result-repository.js';
import * as flashAssessmentResultRepository from '../../infrastructure/repositories/flash-assessment-result-repository.js';
import * as frameworkRepository from '../../infrastructure/repositories/framework-repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import { certificationCompletedJobRepository } from '../../infrastructure/repositories/jobs/certification-completed-job-repository.js';
// Not used in lib
import * as organizationMemberIdentityRepository from '../../infrastructure/repositories/organization-member-identity-repository.js';
import * as targetProfileShareRepository from '../../infrastructure/repositories/target-profile-share-repository.js';
// Not used in lib
import * as targetProfileTrainingRepository from '../../infrastructure/repositories/target-profile-training-repository.js';
import * as thematicRepository from '../../infrastructure/repositories/thematic-repository.js';
// Not used in lib
import * as stageCollectionRepository from '../../infrastructure/repositories/user-campaign-results/stage-collection-repository.js';
import * as userReconciliationService from '../services/user-reconciliation-service.js';
import * as organizationCreationValidator from '../validators/organization-creation-validator.js';
import * as organizationValidator from '../validators/organization-with-tags-and-target-profiles-script.js';

const oidcAuthenticationServiceRegistry = new OidcAuthenticationServiceRegistry({ oidcProviderRepository });

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {certificationBadgesService} CertificationBadgesService
 * @typedef {certificationCenterRepository} CertificationCenterRepository
 * @typedef {certificationRepository} CertificationRepository
 * @typedef {certificationEvaluationCandidateRepository} CertificationEvaluationCandidateRepository
 * @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {complementaryCertificationCourseRepository} ComplementaryCertificationCourseRepository
 * @typedef {finalizedSessionRepository} FinalizedSessionRepository
 * @typedef {mailService} MailService
 * @typedef {placementProfileService} PlacementProfileService
 * @typedef {sessionPublicationService} SessionPublicationService
 * @typedef {sessionRepository} SessionRepository
 * @typedef {centerRepository} CenterRepository
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
 */
const dependencies = {
  accountRecoveryDemandRepository,
  certificationCompletedJobRepository,
  activityAnswerRepository,
  answerJobRepository,
  adminMemberRepository,
  algorithmDataFetcherService,
  answerRepository,
  areaRepository,
  assessmentRepository,
  assessmentResultRepository,
  authenticationMethodRepository,
  authenticationSessionService,
  badgeAcquisitionRepository,
  badgeForCalculationRepository,
  badgeRepository,
  participationCompletedJobRepository,
  campaignParticipationRepository,
  campaignRepository,
  centerRepository,
  certificationAssessmentRepository,
  certificationBadgesService,
  certificationCandidateRepository,
  certificationEvaluationCandidateRepository,
  certificationCenterForAdminRepository,
  certificationCenterInvitationRepository,
  certificationCenterInvitationService,
  certificationCenterInvitedUserRepository,
  certificationCenterMembershipRepository,
  certificationCenterRepository,
  certificationChallengeLiveAlertRepository,
  certificationChallengeRepository,
  certificationCompanionAlertRepository,
  certificationCourseRepository,
  certificationCpfCityRepository,
  certificationOfficerRepository,
  challengeRepository,
  codeGenerator,
  codeUtils,
  competenceEvaluationRepository,
  competenceRepository,
  complementaryCertificationCourseResultRepository,
  complementaryCertificationHabilitationRepository,
  complementaryCertificationRepository,
  config,
  correctionRepository: repositories.correctionRepository,
  courseRepository,
  cryptoService,
  dataProtectionOfficerRepository,
  dateUtils,
  emailRepository,
  emailValidationDemandRepository,
  finalizedSessionRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  flashAssessmentResultRepository,
  frameworkRepository,
  getCompetenceLevel,
  issueReportCategoryRepository,
  juryCertificationRepository,
  juryCertificationSummaryRepository,
  jurySessionRepository,
  knowledgeElementRepository,
  languageService,
  localeService,
  mailService,
  membershipRepository,
  missionRepository,
  obfuscationService,
  oidcAuthenticationServiceRegistry,
  organizationCreationValidator,
  organizationForAdminRepository,
  organizationInvitationRepository,
  organizationInvitationService,
  organizationLearnerIdentityRepository,
  organizationLearnerRepository,
  organizationMemberIdentityRepository,
  organizationRepository,
  organizationTagRepository,
  organizationValidator,
  passwordGenerator,
  passwordValidator,
  pickChallengeService,
  pixAuthenticationService,
  placementProfileService,
  prescriptionOrganizationLearnerRepository,
  refreshTokenRepository,
  resetPasswordDemandRepository,
  resetPasswordService,
  schoolRepository,
  scoAccountRecoveryService,
  scorecardService,
  scoringCertificationService,
  sessionCodeService,
  sessionEnrolmentRepository,
  sessionPublicationService,
  sessionRepository,
  sessionSummaryRepository,
  skillRepository,
  smartRandom,
  stageAcquisitionRepository,
  stageAndStageAcquisitionComparisonService,
  stageCollectionForTargetProfileRepository,
  stageCollectionRepository,
  stageRepository,
  studentRepository,
  supervisorAccessRepository,
  tagRepository,
  targetProfileRepository,
  targetProfileShareRepository,
  targetProfileSummaryForAdminRepository,
  targetProfileTrainingRepository,
  thematicRepository,
  tokenService,
  trainingRepository: repositories.trainingRepository,
  trainingTriggerRepository: repositories.trainingTriggerRepository,
  tubeRepository,
  tutorialEvaluationRepository: repositories.tutorialEvaluationRepository,
  tutorialRepository: repositories.tutorialRepository,
  userAnonymizedEventLoggingJobRepository,
  userEmailRepository,
  userLoginRepository,
  userOrgaSettingsRepository,
  userRecommendedTrainingRepository: repositories.userRecommendedTrainingRepository,
  userReconciliationService,
  userRepository,
  userSavedTutorialRepository,
  userService,
  userToCreateRepository,
  userValidator,
  writeCsvUtils,
  badgeCriteriaRepository,
  sharedSessionRepository,
  improvementService,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
  ...(await importNamedExportsFromDirectory({ path: join(path, './stages') })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { oidcAuthenticationServiceRegistry, usecases };
