// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable import/no-restricted-paths */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as complementaryCertificationCourseRepository from '../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-course-repository.js';
import * as complementaryCertificationRepository from '../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-repository.js';
import * as targetProfileHistoryRepository from '../../../src/certification/complementary-certification/infrastructure/repositories/target-profile-history-repository.js';
import { getNextChallengeForV2Certification } from '../../../src/certification/course/domain/usecases/get-next-challenge-for-v2-certification.js';
import { getNextChallengeForV3Certification } from '../../../src/certification/course/domain/usecases/get-next-challenge-for-v3-certification.js';
import * as sessionCodeService from '../../../src/certification/enrolment/domain/services/session-code-service.js';
import { getCenterForAdmin } from '../../../src/certification/enrolment/domain/usecases/get-center-for-admin.js';
import * as centerRepository from '../../../src/certification/enrolment/infrastructure/repositories/center-repository.js';
import * as certificationCandidateRepository from '../../../src/certification/enrolment/infrastructure/repositories/certification-candidate-repository.js';
import * as certificationCpfCityRepository from '../../../src/certification/enrolment/infrastructure/repositories/certification-cpf-city-repository.js';
import * as sessionEnrolmentRepository from '../../../src/certification/enrolment/infrastructure/repositories/session-repository.js';
import * as flashAlgorithmService from '../../../src/certification/flash-certification/domain/services/algorithm-methods/flash.js';
import * as flashAlgorithmConfigurationRepository from '../../../src/certification/flash-certification/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import * as certificationOfficerRepository from '../../../src/certification/session-management/infrastructure/repositories/certification-officer-repository.js';
import * as finalizedSessionRepository from '../../../src/certification/session-management/infrastructure/repositories/finalized-session-repository.js';
import * as juryCertificationRepository from '../../../src/certification/session-management/infrastructure/repositories/jury-certification-repository.js';
import * as jurySessionRepository from '../../../src/certification/session-management/infrastructure/repositories/jury-session-repository.js';
import * as sessionRepository from '../../../src/certification/session-management/infrastructure/repositories/session-repository.js';
import * as sessionSummaryRepository from '../../../src/certification/session-management/infrastructure/repositories/session-summary-repository.js';
import * as supervisorAccessRepository from '../../../src/certification/session-management/infrastructure/repositories/supervisor-access-repository.js';
import * as certificationBadgesService from '../../../src/certification/shared/domain/services/certification-badges-service.js';
import * as scoringCertificationService from '../../../src/certification/shared/domain/services/scoring-certification-service.js';
import * as certificationAssessmentRepository from '../../../src/certification/shared/infrastructure/repositories/certification-assessment-repository.js';
import * as certificationCenterRepository from '../../../src/certification/shared/infrastructure/repositories/certification-center-repository.js';
import * as certificationChallengeLiveAlertRepository from '../../../src/certification/shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationChallengeRepository from '../../../src/certification/shared/infrastructure/repositories/certification-challenge-repository.js';
import * as certificationCourseRepository from '../../../src/certification/shared/infrastructure/repositories/certification-course-repository.js';
import * as certificationIssueReportRepository from '../../../src/certification/shared/infrastructure/repositories/certification-issue-report-repository.js';
import * as issueReportCategoryRepository from '../../../src/certification/shared/infrastructure/repositories/issue-report-category-repository.js';
import * as sharedSessionRepository from '../../../src/certification/shared/infrastructure/repositories/session-repository.js';
import * as userSavedTutorialRepository from '../../../src/devcomp/infrastructure/repositories/user-saved-tutorial-repository.js';
import * as algorithmDataFetcherService from '../../../src/evaluation/domain/services/algorithm-methods/data-fetcher.js';
import * as smartRandom from '../../../src/evaluation/domain/services/algorithm-methods/smart-random.js';
import { getCompetenceLevel } from '../../../src/evaluation/domain/services/get-competence-level.js';
import * as improvementService from '../../../src/evaluation/domain/services/improvement-service.js';
import { pickChallengeService } from '../../../src/evaluation/domain/services/pick-challenge-service.js';
import * as scorecardService from '../../../src/evaluation/domain/services/scorecard-service.js';
import * as stageAndStageAcquisitionComparisonService from '../../../src/evaluation/domain/services/stages/stage-and-stage-acquisition-comparison-service.js';
import * as badgeCriteriaRepository from '../../../src/evaluation/infrastructure/repositories/badge-criteria-repository.js';
import * as badgeRepository from '../../../src/evaluation/infrastructure/repositories/badge-repository.js';
import * as competenceEvaluationRepository from '../../../src/evaluation/infrastructure/repositories/competence-evaluation-repository.js';
import * as stageAcquisitionRepository from '../../../src/evaluation/infrastructure/repositories/stage-acquisition-repository.js';
import * as stageCollectionForTargetProfileRepository from '../../../src/evaluation/infrastructure/repositories/stage-collection-repository.js';
import * as stageRepository from '../../../src/evaluation/infrastructure/repositories/stage-repository.js';
import { authenticationSessionService } from '../../../src/identity-access-management/domain/services/authentication-session.service.js';
import { OidcAuthenticationServiceRegistry } from '../../../src/identity-access-management/domain/services/oidc-authentication-service-registry.js';
import { pixAuthenticationService } from '../../../src/identity-access-management/domain/services/pix-authentication-service.js';
import { refreshTokenService } from '../../../src/identity-access-management/domain/services/refresh-token-service.js';
import * as resetPasswordService from '../../../src/identity-access-management/domain/services/reset-password.service.js';
import { scoAccountRecoveryService } from '../../../src/identity-access-management/domain/services/sco-account-recovery.service.js';
import { accountRecoveryDemandRepository } from '../../../src/identity-access-management/infrastructure/repositories/account-recovery-demand.repository.js';
import * as authenticationMethodRepository from '../../../src/identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import { emailValidationDemandRepository } from '../../../src/identity-access-management/infrastructure/repositories/email-validation-demand.repository.js';
import * as oidcProviderRepository from '../../../src/identity-access-management/infrastructure/repositories/oidc-provider-repository.js';
import { resetPasswordDemandRepository } from '../../../src/identity-access-management/infrastructure/repositories/reset-password-demand.repository.js';
import * as userRepository from '../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import { userEmailRepository } from '../../../src/identity-access-management/infrastructure/repositories/user-email.repository.js';
import { userToCreateRepository } from '../../../src/identity-access-management/infrastructure/repositories/user-to-create.repository.js';
import { organizationForAdminRepository } from '../../../src/organizational-entities/infrastructure/repositories/organization-for-admin.repository.js';
import { tagRepository } from '../../../src/organizational-entities/infrastructure/repositories/tag.repository.js';
import * as campaignManagementRepository from '../../../src/prescription/campaign/infrastructure/repositories/campaign-management-repository.js';
import * as divisionRepository from '../../../src/prescription/campaign/infrastructure/repositories/division-repository.js';
import * as campaignAssessmentParticipationRepository from '../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-assessment-participation-repository.js';
import * as campaignAssessmentParticipationResultRepository from '../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-assessment-participation-result-repository.js';
import * as campaignParticipationBCRepository from '../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import * as campaignProfileRepository from '../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-profile-repository.js';
import * as supOrganizationLearnerRepository from '../../../src/prescription/learner-management/infrastructure/repositories/sup-organization-learner-repository.js';
import * as organizationLearnerActivityRepository from '../../../src/prescription/organization-learner/infrastructure/repositories/organization-learner-activity-repository.js';
import * as registrationOrganizationLearnerRepository from '../../../src/prescription/organization-learner/infrastructure/repositories/registration-organization-learner-repository.js';
import * as activityAnswerRepository from '../../../src/school/infrastructure/repositories/activity-answer-repository.js';
import * as missionRepository from '../../../src/school/infrastructure/repositories/mission-repository.js';
import * as schoolRepository from '../../../src/school/infrastructure/repositories/school-repository.js';
import { config } from '../../../src/shared/config.js';
import * as codeGenerator from '../../../src/shared/domain/services/code-generator.js';
import { cryptoService } from '../../../src/shared/domain/services/crypto-service.js';
import * as languageService from '../../../src/shared/domain/services/language-service.js';
import * as localeService from '../../../src/shared/domain/services/locale-service.js';
import * as placementProfileService from '../../../src/shared/domain/services/placement-profile-service.js';
import { tokenService } from '../../../src/shared/domain/services/token-service.js';
import * as userService from '../../../src/shared/domain/services/user-service.js';
import * as passwordValidator from '../../../src/shared/domain/validators/password-validator.js';
import * as userValidator from '../../../src/shared/domain/validators/user-validator.js';
import { adminMemberRepository } from '../../../src/shared/infrastructure/repositories/admin-member.repository.js';
import * as answerRepository from '../../../src/shared/infrastructure/repositories/answer-repository.js';
import * as areaRepository from '../../../src/shared/infrastructure/repositories/area-repository.js';
import * as assessmentRepository from '../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as assessmentResultRepository from '../../../src/shared/infrastructure/repositories/assessment-result-repository.js';
import * as challengeRepository from '../../../src/shared/infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as courseRepository from '../../../src/shared/infrastructure/repositories/course-repository.js';
import * as organizationRepository from '../../../src/shared/infrastructure/repositories/organization-repository.js';
import * as skillRepository from '../../../src/shared/infrastructure/repositories/skill-repository.js';
import * as targetProfileForAdminRepository from '../../../src/shared/infrastructure/repositories/target-profile-for-admin-repository.js';
import * as userLoginRepository from '../../../src/shared/infrastructure/repositories/user-login-repository.js';
import * as codeUtils from '../../../src/shared/infrastructure/utils/code-utils.js';
import * as writeCsvUtils from '../../../src/shared/infrastructure/utils/csv/write-csv-utils.js';
import * as dateUtils from '../../../src/shared/infrastructure/utils/date-utils.js';
import { injectDependencies } from '../../../src/shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../src/shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as certificationCenterInvitationService from '../../../src/team/domain/services/certification-center-invitation-service.js';
import { organizationInvitationService } from '../../../src/team/domain/services/organization-invitation.service.js';
import * as certificationCenterInvitationRepository from '../../../src/team/infrastructure/repositories/certification-center-invitation-repository.js';
import { organizationInvitationRepository } from '../../../src/team/infrastructure/repositories/organization-invitation.repository.js';
import { userOrgaSettingsRepository } from '../../../src/team/infrastructure/repositories/user-orga-settings-repository.js';
import * as certificationChallengesService from '../../domain/services/certification-challenges-service.js';
import * as mailService from '../../domain/services/mail-service.js';
import * as obfuscationService from '../../domain/services/obfuscation-service.js';
import * as passwordGenerator from '../../domain/services/password-generator.js';
import * as sessionPublicationService from '../../domain/services/session-publication-service.js';
import * as verifyCertificateCodeService from '../../domain/services/verify-certificate-code-service.js';
import * as disabledPoleEmploiNotifier from '../../infrastructure/externals/pole-emploi/disabled-pole-emploi-notifier.js';
import * as poleEmploiNotifier from '../../infrastructure/externals/pole-emploi/pole-emploi-notifier.js';
import * as badgeAcquisitionRepository from '../../infrastructure/repositories/badge-acquisition-repository.js';
import * as badgeForCalculationRepository from '../../infrastructure/repositories/badge-for-calculation-repository.js';
import * as campaignParticipationOverviewRepository from '../../infrastructure/repositories/campaign-participation-overview-repository.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import { campaignParticipationResultRepository } from '../../infrastructure/repositories/campaign-participation-result-repository.js';
import * as campaignRepository from '../../infrastructure/repositories/campaign-repository.js';
import * as certifiableProfileForLearningContentRepository from '../../infrastructure/repositories/certifiable-profile-for-learning-content-repository.js';
import * as certificationCenterForAdminRepository from '../../infrastructure/repositories/certification-center-for-admin-repository.js';
import * as certificationCenterInvitedUserRepository from '../../infrastructure/repositories/certification-center-invited-user-repository.js';
import * as certificationCenterMembershipRepository from '../../infrastructure/repositories/certification-center-membership-repository.js';
import * as certificationPointOfContactRepository from '../../infrastructure/repositories/certification-point-of-contact-repository.js';
import * as certificationRepository from '../../infrastructure/repositories/certification-repository.js';
import * as competenceMarkRepository from '../../infrastructure/repositories/competence-mark-repository.js';
import * as complementaryCertificationCourseResultRepository from '../../infrastructure/repositories/complementary-certification-course-result-repository.js';
import * as complementaryCertificationHabilitationRepository from '../../infrastructure/repositories/complementary-certification-habilitation-repository.js';
import * as dataProtectionOfficerRepository from '../../infrastructure/repositories/data-protection-officer-repository.js';
import * as flashAssessmentResultRepository from '../../infrastructure/repositories/flash-assessment-result-repository.js';
import * as frameworkRepository from '../../infrastructure/repositories/framework-repository.js';
import { repositories } from '../../infrastructure/repositories/index.js';
import * as juryCertificationSummaryRepository from '../../infrastructure/repositories/jury-certification-summary-repository.js';
import * as knowledgeElementRepository from '../../infrastructure/repositories/knowledge-element-repository.js';
import * as learningContentRepository from '../../infrastructure/repositories/learning-content-repository.js';
import * as membershipRepository from '../../infrastructure/repositories/membership-repository.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import * as organizationMemberIdentityRepository from '../../infrastructure/repositories/organization-member-identity-repository.js';
import * as organizationTagRepository from '../../infrastructure/repositories/organization-tag-repository.js';
import * as participantResultRepository from '../../infrastructure/repositories/participant-result-repository.js';
import { participantResultsSharedRepository } from '../../infrastructure/repositories/participant-results-shared-repository.js';
import * as poleEmploiSendingRepository from '../../infrastructure/repositories/pole-emploi-sending-repository.js';
import * as studentRepository from '../../infrastructure/repositories/student-repository.js';
import * as targetProfileForUpdateRepository from '../../infrastructure/repositories/target-profile-for-update-repository.js';
import * as targetProfileRepository from '../../infrastructure/repositories/target-profile-repository.js';
import * as targetProfileShareRepository from '../../infrastructure/repositories/target-profile-share-repository.js';
import * as targetProfileSummaryForAdminRepository from '../../infrastructure/repositories/target-profile-summary-for-admin-repository.js';
import * as targetProfileTrainingRepository from '../../infrastructure/repositories/target-profile-training-repository.js';
import * as thematicRepository from '../../infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../../infrastructure/repositories/tube-repository.js';
import * as stageCollectionRepository from '../../infrastructure/repositories/user-campaign-results/stage-collection-repository.js';
import * as userOrganizationsForAdminRepository from '../../infrastructure/repositories/user-organizations-for-admin-repository.js';
import * as learningContentConversionService from '../services/learning-content/learning-content-conversion-service.js';
import * as userReconciliationService from '../services/user-reconciliation-service.js';
import * as organizationCreationValidator from '../validators/organization-creation-validator.js';
import * as organizationValidator from '../validators/organization-with-tags-and-target-profiles-script.js';

const oidcAuthenticationServiceRegistry = new OidcAuthenticationServiceRegistry({ oidcProviderRepository });

function requirePoleEmploiNotifier() {
  if (config.poleEmploi.pushEnabled) {
    return poleEmploiNotifier;
  } else {
    return disabledPoleEmploiNotifier;
  }
}

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {certificationBadgesService} CertificationBadgesService
 * @typedef {certificationCenterRepository} CertificationCenterRepository
 * @typedef {certificationRepository} CertificationRepository
 * @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {complementaryCertificationCourseRepository} ComplementaryCertificationCourseRepository
 * @typedef {finalizedSessionRepository} FinalizedSessionRepository
 * @typedef {mailService} MailService
 * @typedef {placementProfileService} PlacementProfileService
 * @typedef {sessionPublicationService} SessionPublicationService
 * @typedef {sessionRepository} SessionRepository
 * @typedef {centerRepository} CenterRepository
 * @typedef {certificationCenterForAdminRepository} CertificationCenterForAdminRepository
 * @typedef {complementaryCertificationHabilitationRepository} ComplementaryCertificationHabilitationRepository
 * @typedef {dataProtectionOfficerRepository} DataProtectionOfficerRepository
 */

const dependencies = {
  accountRecoveryDemandRepository,
  activityAnswerRepository,
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
  campaignAssessmentParticipationRepository,
  campaignAssessmentParticipationResultRepository,
  campaignManagementRepository,
  campaignParticipationBCRepository,
  campaignParticipationOverviewRepository,
  campaignParticipationRepository,
  campaignParticipationResultRepository,
  campaignProfileRepository,
  campaignRepository,
  centerRepository,
  certifiableProfileForLearningContentRepository,
  certificationAssessmentRepository,
  certificationBadgesService,
  certificationCandidateRepository,
  certificationCenterForAdminRepository,
  certificationCenterInvitationRepository,
  certificationCenterInvitationService,
  certificationCenterInvitedUserRepository,
  certificationCenterMembershipRepository,
  certificationCenterRepository,
  certificationChallengeLiveAlertRepository,
  certificationChallengeRepository,
  certificationChallengesService,
  certificationCourseRepository,
  certificationCpfCityRepository,
  certificationIssueReportRepository,
  certificationOfficerRepository,
  certificationPointOfContactRepository,
  certificationRepository,
  challengeRepository,
  codeGenerator,
  codeUtils,
  competenceEvaluationRepository,
  competenceMarkRepository,
  competenceRepository,
  complementaryCertificationCourseRepository,
  complementaryCertificationCourseResultRepository,
  complementaryCertificationHabilitationRepository,
  complementaryCertificationRepository,
  config,
  correctionRepository: repositories.correctionRepository,
  courseRepository,
  cryptoService,
  dataProtectionOfficerRepository,
  dateUtils,
  divisionRepository,
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
  learningContentConversionService,
  learningContentRepository,
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
  organizationLearnerActivityRepository,
  organizationLearnerRepository,
  organizationMemberIdentityRepository,
  organizationRepository,
  organizationTagRepository,
  organizationValidator,
  participantResultRepository,
  participantResultsSharedRepository,
  passwordGenerator,
  passwordValidator,
  pickChallengeService,
  pixAuthenticationService,
  placementProfileService,
  poleEmploiNotifier: requirePoleEmploiNotifier(),
  poleEmploiSendingRepository,
  refreshTokenService,
  registrationOrganizationLearnerRepository,
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
  supOrganizationLearnerRepository,
  tagRepository,
  targetProfileForAdminRepository,
  targetProfileForUpdateRepository,
  targetProfileHistoryRepository,
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
  userEmailRepository,
  userLoginRepository,
  userOrganizationsForAdminRepository,
  userOrgaSettingsRepository,
  userRecommendedTrainingRepository: repositories.userRecommendedTrainingRepository,
  userReconciliationService,
  userRepository,
  userSavedTutorialRepository,
  userService,
  userToCreateRepository,
  userValidator,
  verifyCertificateCodeService,
  writeCsvUtils,
  badgeCriteriaRepository,
  sharedSessionRepository,
  improvementService,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
  ...(await importNamedExportsFromDirectory({ path: join(path, './stages') })),
  getNextChallengeForV2Certification,
  getNextChallengeForV3Certification,
  getCenterForAdmin,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { oidcAuthenticationServiceRegistry, usecases };
