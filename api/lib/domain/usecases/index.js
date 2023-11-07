// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable import/no-restricted-paths */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { config } from '../../config.js';

import { repositories } from '../../infrastructure/repositories/index.js';

import * as accountRecoveryDemandRepository from '../../infrastructure/repositories/account-recovery-demand-repository.js';
import * as activityAnswerRepository from '../../infrastructure/repositories/activity-answer-repository.js';
import * as activityRepository from '../../infrastructure/repositories/activity-repository.js';
import * as adminMemberRepository from '../../infrastructure/repositories/admin-member-repository.js';
import * as algorithmDataFetcherService from '../../domain/services/algorithm-methods/data-fetcher.js';
import * as answerRepository from '../../../src/evaluation/infrastructure/repositories/answer-repository.js';
import * as areaRepository from '../../infrastructure/repositories/area-repository.js';
import * as assessmentRepository from '../../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as assessmentResultRepository from '../../infrastructure/repositories/assessment-result-repository.js';
import * as attachableTargetProfileRepository from '../../infrastructure/repositories/attachable-target-profiles-repository.js';
import * as authenticationMethodRepository from '../../infrastructure/repositories/authentication-method-repository.js';
import * as authenticationServiceRegistry from '../services/authentication/authentication-service-registry.js';
import * as authenticationSessionService from '../../domain/services/authentication/authentication-session-service.js';
import * as badgeAcquisitionRepository from '../../infrastructure/repositories/badge-acquisition-repository.js';
import * as badgeCriteriaRepository from '../../infrastructure/repositories/badge-criteria-repository.js';
import * as badgeForCalculationRepository from '../../infrastructure/repositories/badge-for-calculation-repository.js';
import * as badgeRepository from '../../infrastructure/repositories/badge-repository.js';
import * as campaignAdministrationRepository from '../../infrastructure/repositories/campaigns-administration/campaign-repository.js';
import * as campaignAnalysisRepository from '../../infrastructure/repositories/campaign-analysis-repository.js';
import * as campaignAssessmentParticipationRepository from '../../infrastructure/repositories/campaign-assessment-participation-repository.js';
import * as campaignAssessmentParticipationResultListRepository from '../../infrastructure/repositories/campaign-assessment-participation-result-list-repository.js';
import * as campaignAssessmentParticipationResultRepository from '../../infrastructure/repositories/campaign-assessment-participation-result-repository.js';
import * as codeGenerator from '../services/code-generator.js';
import * as campaignCollectiveResultRepository from '../../infrastructure/repositories/campaign-collective-result-repository.js';
import * as campaignCreatorRepository from '../../infrastructure/repositories/campaign-creator-repository.js';
import * as campaignCsvExportService from '../../domain/services/campaign-csv-export-service.js';
import * as campaignForArchivingRepository from '../../infrastructure/repositories/campaign/campaign-for-archiving-repository.js';
import * as campaignManagementRepository from '../../infrastructure/repositories/campaign-management-repository.js';
import * as campaignParticipantRepository from '../../infrastructure/repositories/campaign-participant-repository.js';
import * as campaignParticipationInfoRepository from '../../infrastructure/repositories/campaign-participation-info-repository.js';
import * as campaignParticipationOverviewRepository from '../../infrastructure/repositories/campaign-participation-overview-repository.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import * as campaignProfileRepository from '../../infrastructure/repositories/campaign-profile-repository.js';
import * as campaignProfilesCollectionParticipationSummaryRepository from '../../infrastructure/repositories/campaign-profiles-collection-participation-summary-repository.js';
import * as campaignReportRepository from '../../infrastructure/repositories/campaign-report-repository.js';
import * as campaignRepository from '../../infrastructure/repositories/campaign-repository.js';
import * as campaignToJoinRepository from '../../infrastructure/repositories/campaign-to-join-repository.js';
import * as campaignValidator from '../validators/campaign-validator.js';
import * as certifiableProfileForLearningContentRepository from '../../infrastructure/repositories/certifiable-profile-for-learning-content-repository.js';
import * as certificateRepository from '../../infrastructure/repositories/certificate-repository.js';
import * as certificationAssessmentRepository from '../../infrastructure/repositories/certification-assessment-repository.js';
import * as certificationAttestationPdf from '../../infrastructure/utils/pdf/certification-attestation-pdf.js';
import * as certificationBadgesService from '../../domain/services/certification-badges-service.js';
import * as certificationCandidateForSupervisingRepository from '../../infrastructure/repositories/certification-candidate-for-supervising-repository.js';
import * as certificationCandidateRepository from '../../infrastructure/repositories/certification-candidate-repository.js';
import * as certificationCandidatesOdsService from '../../domain/services/certification-candidates-ods-service.js';
import * as certificationCenterForAdminRepository from '../../infrastructure/repositories/certification-center-for-admin-repository.js';
import * as certificationCenterInvitationRepository from '../../infrastructure/repositories/certification-center-invitation-repository.js';
import * as certificationCenterInvitationService from '../../domain/services/certification-center-invitation-service.js';
import * as certificationCenterInvitedUserRepository from '../../infrastructure/repositories/certification-center-invited-user-repository.js';
import * as certificationCenterMembershipRepository from '../../infrastructure/repositories/certification-center-membership-repository.js';
import * as certificationCenterRepository from '../../../src/certification/shared/infrastructure/repositories/certification-center-repository.js';
import * as certificationChallengeLiveAlertRepository from '../../../src/certification/session/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationChallengeRepository from '../../infrastructure/repositories/certification-challenge-repository.js';
import * as certificationChallengesService from '../../domain/services/certification-challenges-service.js';
import * as certificationCourseRepository from '../../infrastructure/repositories/certification-course-repository.js';
import * as certificationCpfCityRepository from '../../infrastructure/repositories/certification-cpf-city-repository.js';
import * as certificationCpfCountryRepository from '../../infrastructure/repositories/certification-cpf-country-repository.js';
import * as certificationCpfService from '../../domain/services/certification-cpf-service.js';
import * as certificationIssueReportRepository from '../../../src/certification/shared/infrastructure/repositories/certification-issue-report-repository.js';
import * as certificationLsRepository from '../../infrastructure/repositories/certification-livret-scolaire-repository.js';
import * as certificationOfficerRepository from '../../infrastructure/repositories/certification-officer-repository.js';
import * as certificationPointOfContactRepository from '../../infrastructure/repositories/certification-point-of-contact-repository.js';
import * as certificationReportRepository from '../../infrastructure/repositories/certification-report-repository.js';
import * as certificationRepository from '../../infrastructure/repositories/certification-repository.js';
import * as certificationResultRepository from '../../infrastructure/repositories/certification-result-repository.js';
import * as challengeRepository from '../../infrastructure/repositories/challenge-repository.js';
import * as cleaCertifiedCandidateRepository from '../../infrastructure/repositories/clea-certified-candidate-repository.js';
import * as codeUtils from '../../infrastructure/utils/code-utils.js';
import * as competenceEvaluationRepository from '../../../src/evaluation/infrastructure/repositories/competence-evaluation-repository.js';
import * as competenceMarkRepository from '../../infrastructure/repositories/competence-mark-repository.js';
import * as competenceRepository from '../../../src/shared/infrastructure/repositories/competence-repository.js';
import * as competenceTreeRepository from '../../infrastructure/repositories/competence-tree-repository.js';
import * as complementaryCertificationCourseResultRepository from '../../infrastructure/repositories/complementary-certification-course-result-repository.js';
import * as complementaryCertificationHabilitationRepository from '../../infrastructure/repositories/complementary-certification-habilitation-repository.js';
import * as complementaryCertificationRepository from '../../infrastructure/repositories/complementary-certification-repository.js';
import * as countryRepository from '../../infrastructure/repositories/country-repository.js';
import * as courseRepository from '../../infrastructure/repositories/course-repository.js';
import * as dataProtectionOfficerRepository from '../../infrastructure/repositories/data-protection-officer-repository.js';
import * as disabledPoleEmploiNotifier from '../../infrastructure/externals/pole-emploi/disabled-pole-emploi-notifier.js';
import * as divisionRepository from '../../infrastructure/repositories/division-repository.js';
import * as encryptionService from '../../domain/services/encryption-service.js';
import * as feedbackRepository from '../../infrastructure/repositories/feedback-repository.js';
import * as finalizedSessionRepository from '../../infrastructure/repositories/sessions/finalized-session-repository.js';
import * as flashAlgorithmService from '../../domain/services/algorithm-methods/flash.js';
import * as flashAssessmentResultRepository from '../../infrastructure/repositories/flash-assessment-result-repository.js';
import * as frameworkRepository from '../../infrastructure/repositories/framework-repository.js';
import * as groupRepository from '../../infrastructure/repositories/group-repository.js';
import * as improvementService from '../../domain/services/improvement-service.js';
import * as issueReportCategoryRepository from '../../../src/certification/shared/infrastructure/repositories/issue-report-category-repository.js';
import * as juryCertificationRepository from '../../infrastructure/repositories/jury-certification-repository.js';
import * as juryCertificationSummaryRepository from '../../infrastructure/repositories/jury-certification-summary-repository.js';
import * as jurySessionRepository from '../../infrastructure/repositories/sessions/jury-session-repository.js';
import * as knowledgeElementRepository from '../../infrastructure/repositories/knowledge-element-repository.js';
import * as learningContentConversionService from '../services/learning-content/learning-content-conversion-service.js';
import * as learningContentRepository from '../../infrastructure/repositories/learning-content-repository.js';
import * as localeService from '../../domain/services/locale-service.js';
import * as mailService from '../../domain/services/mail-service.js';
import * as membershipRepository from '../../infrastructure/repositories/membership-repository.js';
import * as missionRepository from '../../infrastructure/repositories/mission-repository.js';
import * as obfuscationService from '../../domain/services/obfuscation-service.js';
import * as organizationCreationValidator from '../validators/organization-creation-validator.js';
import * as organizationForAdminRepository from '../../infrastructure/repositories/organization-for-admin-repository.js';
import * as organizationInvitationRepository from '../../infrastructure/repositories/organization-invitation-repository.js';
import * as organizationInvitationService from '../services/organization-invitation-service.js';
import * as organizationInvitedUserRepository from '../../infrastructure/repositories/organization-invited-user-repository.js';
import * as organizationLearnerActivityRepository from '../../infrastructure/repositories/organization-learner-activity-repository.js';
import * as organizationLearnerFollowUpRepository from '../../infrastructure/repositories/organization-learner-follow-up/organization-learner-repository.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import * as organizationLearnersCsvService from '../../domain/services/organization-learners-csv-service.js';
import * as organizationLearnersXmlService from '../../domain/services/organization-learners-xml-service.js';
import * as organizationMemberIdentityRepository from '../../infrastructure/repositories/organization-member-identity-repository.js';
import * as organizationParticipantRepository from '../../infrastructure/repositories/organization-participant-repository.js';
import * as organizationPlacesCapacityRepository from '../../infrastructure/repositories/organization-places-capacity-repository.js';
import * as organizationPlacesLotRepository from '../../infrastructure/repositories/organizations/organization-places-lot-repository.js';
import * as organizationRepository from '../../infrastructure/repositories/organization-repository.js';
import * as organizationsToAttachToTargetProfileRepository from '../../infrastructure/repositories/organizations-to-attach-to-target-profile-repository.js';
import * as organizationTagRepository from '../../infrastructure/repositories/organization-tag-repository.js';
import * as organizationValidator from '../validators/organization-with-tags-and-target-profiles-script.js';
import * as participantResultRepository from '../../infrastructure/repositories/participant-result-repository.js';
import * as participationsForCampaignManagementRepository from '../../infrastructure/repositories/participations-for-campaign-management-repository.js';
import * as participationsForUserManagementRepository from '../../infrastructure/repositories/participations-for-user-management-repository.js';
import * as partnerCertificationScoringRepository from '../../infrastructure/repositories/partner-certification-scoring-repository.js';
import * as passwordGenerator from '../../domain/services/password-generator.js';
import * as passwordValidator from '../validators/password-validator.js';
import * as pixAuthenticationService from '../../domain/services/authentication/pix-authentication-service.js';
import * as schoolRepository from '../../../src/school/infrastructure/repositories/school-repository.js';
import * as placementProfileService from '../../domain/services/placement-profile-service.js';
import * as poleEmploiNotifier from '../../infrastructure/externals/pole-emploi/pole-emploi-notifier.js';
import * as poleEmploiSendingRepository from '../../infrastructure/repositories/pole-emploi-sending-repository.js';
import * as prescriberRepository from '../../infrastructure/repositories/prescriber-repository.js';
import * as refreshTokenService from '../../domain/services/refresh-token-service.js';
import * as resetPasswordDemandRepository from '../../infrastructure/repositories/reset-password-demands-repository.js';
import * as resetPasswordService from '../../domain/services/reset-password-service.js';
import * as scoAccountRecoveryService from '../services/sco-account-recovery-service.js';
import * as scoCertificationCandidateRepository from '../../infrastructure/repositories/sco-certification-candidate-repository.js';
import * as scoOrganizationParticipantRepository from '../../infrastructure/repositories/sco-organization-participant-repository.js';
import * as scorecardService from '../../domain/services/scorecard-service.js';
import * as scoringCertificationService from '../../domain/services/scoring/scoring-certification-service.js';
import * as sessionCodeService from '../../../src/certification/session/domain/services/session-code-service.js';
import * as sessionForSupervisingRepository from '../../infrastructure/repositories/sessions/session-for-supervising-repository.js';
import * as sessionForSupervisorKitRepository from '../../infrastructure/repositories/sessions/session-for-supervisor-kit-repository.js';
import * as sessionJuryCommentRepository from '../../infrastructure/repositories/sessions/session-jury-comment-repository.js';
import * as sessionPublicationService from '../../domain/services/session-publication-service.js';
import * as sessionRepository from '../../../src/certification/session/infrastructure/repositories/session-repository.js';
import * as sessionsImportValidationService from '../../domain/services/sessions-mass-import/sessions-import-validation-service.js';
import * as sessionSummaryRepository from '../../infrastructure/repositories/sessions/session-summary-repository.js';
import * as sessionValidator from '../../../src/certification/session/domain/validators/session-validator.js';
import * as skillRepository from '../../infrastructure/repositories/skill-repository.js';
import * as smartRandom from '../../domain/services/algorithm-methods/smart-random.js';
import * as stageAcquisitionRepository from '../../infrastructure/repositories/stage-acquisition-repository.js';
import * as stageCollectionForTargetProfileRepository from '../../infrastructure/repositories/target-profile-management/stage-collection-repository.js';
import * as stageCollectionRepository from '../../infrastructure/repositories/user-campaign-results/stage-collection-repository.js';
import * as stageRepository from '../../infrastructure/repositories/stage-repository.js';
import * as studentRepository from '../../infrastructure/repositories/student-repository.js';
import * as supervisorAccessRepository from '../../infrastructure/repositories/supervisor-access-repository.js';
import * as supOrganizationLearnerRepository from '../../../src/prescription/learner-management/infrastructure/repositories/sup-organization-learner-repository.js';
import * as supOrganizationParticipantRepository from '../../infrastructure/repositories/sup-organization-participant-repository.js';
import * as tagRepository from '../../infrastructure/repositories/tag-repository.js';
import * as targetProfileForAdminRepository from '../../infrastructure/repositories/target-profile-for-admin-repository.js';
import * as TargetProfileForSpecifierRepository from '../../infrastructure/repositories/campaign/target-profile-for-specifier-repository.js';
import * as targetProfileForUpdateRepository from '../../infrastructure/repositories/target-profile-for-update-repository.js';
import * as targetProfileRepository from '../../infrastructure/repositories/target-profile-repository.js';
import * as targetProfileShareRepository from '../../infrastructure/repositories/target-profile-share-repository.js';
import * as targetProfileSummaryForAdminRepository from '../../infrastructure/repositories/target-profile-summary-for-admin-repository.js';
import * as targetProfileTrainingRepository from '../../infrastructure/repositories/target-profile-training-repository.js';
import * as temporarySessionsStorageForMassImportService from '../services/sessions-mass-import/temporary-sessions-storage-for-mass-import-service.js';
import * as thematicRepository from '../../infrastructure/repositories/thematic-repository.js';
import * as tubeRepository from '../../infrastructure/repositories/tube-repository.js';
import * as userEmailRepository from '../../infrastructure/repositories/user-email-repository.js';
import * as userLoginRepository from '../../infrastructure/repositories/user-login-repository.js';
import * as userOrganizationsForAdminRepository from '../../infrastructure/repositories/user-organizations-for-admin-repository.js';
import * as userOrgaSettingsRepository from '../../infrastructure/repositories/user-orga-settings-repository.js';
import * as userReconciliationService from '../services/user-reconciliation-service.js';
import * as userRepository from '../../../src/shared/infrastructure/repositories/user-repository.js';
import * as userSavedTutorialRepository from '../../infrastructure/repositories/user-saved-tutorial-repository.js';
import * as userService from '../../domain/services/user-service.js';
import * as userToCreateRepository from '../../infrastructure/repositories/user-to-create-repository.js';
import * as userValidator from '../validators/user-validator.js';
import * as verifyCertificateCodeService from '../../domain/services/verify-certificate-code-service.js';
import * as writeCsvUtils from '../../infrastructure/utils/csv/write-csv-utils.js';
import * as writeOdsUtils from '../../infrastructure/utils/ods/write-ods-utils.js';
import * as stageAndStageAcquisitionComparisonService from '../../domain/services/stages/stage-and-stage-acquisition-comparison-service.js';
import { CampaignParticipationsStatsRepository as campaignParticipationsStatsRepository } from '../../infrastructure/repositories/campaign-participations-stats-repository.js';
import { campaignParticipantActivityRepository } from '../../infrastructure/repositories/campaign-participant-activity-repository.js';
import { campaignParticipationResultRepository } from '../../infrastructure/repositories/campaign-participation-result-repository.js';
import { getCompetenceLevel } from '../../../src/evaluation/domain/services/get-competence-level.js';
import { participantResultsSharedRepository } from '../../infrastructure/repositories/participant-results-shared-repository.js';
import { pickChallengeService } from '../services/pick-challenge-service.js';
import { tokenService } from '../services/token-service.js';

import * as dateUtils from '../../../src/shared/infrastructure/utils/date-utils.js';

import { importNamedExportsFromDirectory } from '../../../src/shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../src/shared/infrastructure/utils/dependency-injection.js';
import { findTargetProfileOrganizations as findPaginatedFilteredTargetProfileOrganizations } from './find-paginated-filtered-target-profile-organizations.js';
import { getCampaignManagement as getCampaignDetailsManagement } from './get-campaign-details-management.js';

function requirePoleEmploiNotifier() {
  if (config.poleEmploi.pushEnabled) {
    return poleEmploiNotifier;
  } else {
    return disabledPoleEmploiNotifier;
  }
}

const dependencies = {
  accountRecoveryDemandRepository,
  activityAnswerRepository,
  activityRepository,
  adminMemberRepository,
  algorithmDataFetcherService,
  answerRepository,
  areaRepository,
  assessmentRepository,
  assessmentResultRepository,
  attachableTargetProfileRepository,
  authenticationMethodRepository,
  authenticationServiceRegistry,
  authenticationSessionService,
  badgeAcquisitionRepository,
  badgeCriteriaRepository,
  badgeForCalculationRepository,
  badgeRepository,
  campaignAdministrationRepository,
  campaignAnalysisRepository,
  campaignAssessmentParticipationRepository,
  campaignAssessmentParticipationResultListRepository,
  campaignAssessmentParticipationResultRepository,
  campaignCollectiveResultRepository,
  campaignCreatorRepository,
  campaignCsvExportService,
  campaignForArchivingRepository,
  campaignManagementRepository,
  campaignParticipantActivityRepository,
  campaignParticipantRepository,
  campaignParticipationInfoRepository,
  campaignParticipationOverviewRepository,
  campaignParticipationRepository,
  campaignParticipationResultRepository,
  campaignParticipationsStatsRepository,
  campaignProfileRepository,
  campaignProfilesCollectionParticipationSummaryRepository,
  campaignReportRepository,
  campaignRepository,
  campaignToJoinRepository,
  campaignValidator,
  certifiableProfileForLearningContentRepository,
  certificateRepository,
  certificationAssessmentRepository,
  certificationAttestationPdf,
  certificationBadgesService,
  certificationCandidateForSupervisingRepository,
  certificationCandidateRepository,
  certificationCandidatesOdsService,
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
  certificationCpfCountryRepository,
  certificationCpfService,
  certificationIssueReportRepository,
  certificationLsRepository,
  certificationOfficerRepository,
  certificationPointOfContactRepository,
  certificationReportRepository,
  certificationRepository,
  certificationResultRepository,
  challengeRepository,
  cleaCertifiedCandidateRepository,
  codeGenerator,
  codeUtils,
  competenceEvaluationRepository,
  competenceMarkRepository,
  competenceRepository,
  competenceTreeRepository,
  complementaryCertificationCourseResultRepository,
  complementaryCertificationHabilitationRepository,
  complementaryCertificationRepository,
  config,
  correctionRepository: repositories.correctionRepository,
  countryRepository,
  courseRepository,
  dataProtectionOfficerRepository,
  dateUtils,
  divisionRepository,
  encryptionService,
  feedbackRepository,
  finalizedSessionRepository,
  flashAlgorithmService,
  flashAssessmentResultRepository,
  frameworkRepository,
  getCompetenceLevel,
  groupRepository,
  improvementService,
  issueReportCategoryRepository,
  juryCertificationRepository,
  juryCertificationSummaryRepository,
  jurySessionRepository,
  knowledgeElementRepository,
  learningContentConversionService,
  learningContentRepository,
  localeService,
  mailService,
  membershipRepository,
  missionRepository,
  obfuscationService,
  organizationCreationValidator,
  organizationForAdminRepository,
  organizationInvitationRepository,
  organizationInvitationService,
  organizationInvitedUserRepository,
  organizationLearnerActivityRepository,
  organizationLearnerFollowUpRepository,
  organizationLearnerRepository,
  organizationLearnersCsvService,
  organizationLearnersXmlService,
  organizationMemberIdentityRepository,
  organizationParticipantRepository,
  organizationPlacesCapacityRepository,
  organizationPlacesLotRepository,
  organizationRepository,
  organizationsToAttachToTargetProfileRepository,
  organizationTagRepository,
  organizationValidator,
  participantResultRepository,
  participantResultsSharedRepository,
  participationsForCampaignManagementRepository,
  participationsForUserManagementRepository,
  partnerCertificationScoringRepository,
  passwordGenerator,
  passwordValidator,
  pickChallengeService,
  pixAuthenticationService,
  placementProfileService,
  poleEmploiNotifier: requirePoleEmploiNotifier(),
  poleEmploiSendingRepository,
  prescriberRepository,
  refreshTokenService,
  resetPasswordDemandRepository,
  resetPasswordService,
  schoolRepository,
  scoAccountRecoveryService,
  scoCertificationCandidateRepository,
  scoOrganizationParticipantRepository,
  scorecardService,
  scoringCertificationService,
  sessionCodeService,
  sessionForSupervisingRepository,
  sessionForSupervisorKitRepository,
  sessionJuryCommentRepository,
  sessionPublicationService,
  sessionRepository,
  sessionSummaryRepository,
  sessionValidator,
  sessionsImportValidationService,
  skillRepository,
  smartRandom,
  stageAndStageAcquisitionComparisonService,
  stageCollectionForTargetProfileRepository,
  stageCollectionRepository,
  stageRepository,
  stageAcquisitionRepository,
  studentRepository,
  supervisorAccessRepository,
  supOrganizationLearnerRepository,
  supOrganizationParticipantRepository,
  tagRepository,
  targetProfileForAdminRepository,
  TargetProfileForSpecifierRepository,
  targetProfileForUpdateRepository,
  targetProfileRepository,
  targetProfileShareRepository,
  targetProfileSummaryForAdminRepository,
  targetProfileTrainingRepository,
  temporarySessionsStorageForMassImportService,
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
  writeOdsUtils,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
  ...(await importNamedExportsFromDirectory({ path: join(path, './account-recovery') })),
  ...(await importNamedExportsFromDirectory({ path: join(path, './authentication') })),
  ...(await importNamedExportsFromDirectory({ path: join(path, './campaigns-administration') })),
  ...(await importNamedExportsFromDirectory({ path: join(path, './certificate') })),
  ...(await importNamedExportsFromDirectory({ path: join(path, './organizations-administration') })),
  ...(await importNamedExportsFromDirectory({ path: join(path, './sessions-mass-import') })),
  ...(await importNamedExportsFromDirectory({ path: join(path, './stages') })),
  ...(await importNamedExportsFromDirectory({ path: join(path, './target-profile-management') })),
  findPaginatedFilteredTargetProfileOrganizations,
  getCampaignDetailsManagement,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
