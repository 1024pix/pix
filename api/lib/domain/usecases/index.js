import { config } from '../../config.js';
import * as accountRecoveryDemandRepository from '../../infrastructure/repositories/account-recovery-demand-repository.js';
import * as adminMemberRepository from '../../infrastructure/repositories/admin-member-repository.js';
// eslint-disable-next-line import/no-duplicates
import * as dataFetcher from '../../domain/services/algorithm-methods/data-fetcher.js';
// eslint-disable-next-line import/no-duplicates
import * as algorithmDataFetcherService from '../../domain/services/algorithm-methods/data-fetcher.js';
import * as answerRepository from '../../infrastructure/repositories/answer-repository.js';
import * as areaRepository from '../../infrastructure/repositories/area-repository.js';
import * as assessmentRepository from '../../infrastructure/repositories/assessment-repository.js';
import * as assessmentResultRepository from '../../infrastructure/repositories/assessment-result-repository.js';
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
import * as campaignCreatorRepository from '../../infrastructure/repositories/campaign-creator-repository.js';
import * as campaignForArchivingRepository from '../../infrastructure/repositories/campaign/campaign-for-archiving-repository.js';
import { campaignParticipantActivityRepository } from '../../infrastructure/repositories/campaign-participant-activity-repository.js';
import * as campaignCollectiveResultRepository from '../../infrastructure/repositories/campaign-collective-result-repository.js';
import * as campaignManagementRepository from '../../infrastructure/repositories/campaign-management-repository.js';
import * as campaignParticipationInfoRepository from '../../infrastructure/repositories/campaign-participation-info-repository.js';
import * as campaignParticipantRepository from '../../infrastructure/repositories/campaign-participant-repository.js';
import * as campaignParticipationOverviewRepository from '../../infrastructure/repositories/campaign-participation-overview-repository.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import * as campaignParticipationResultRepository from '../../infrastructure/repositories/campaign-participation-result-repository.js';
import { CampaignParticipationsStatsRepository as campaignParticipationsStatsRepository } from '../../infrastructure/repositories/campaign-participations-stats-repository.js';
import * as campaignProfilesCollectionParticipationSummaryRepository from '../../infrastructure/repositories/campaign-profiles-collection-participation-summary-repository.js';
import * as campaignProfileRepository from '../../infrastructure/repositories/campaign-profile-repository.js';
import * as campaignReportRepository from '../../infrastructure/repositories/campaign-report-repository.js';
import * as campaignRepository from '../../infrastructure/repositories/campaign-repository.js';
import * as campaignToJoinRepository from '../../infrastructure/repositories/campaign-to-join-repository.js';
import * as campaignCsvExportService from '../../domain/services/campaign-csv-export-service.js';
import * as certifiableProfileForLearningContentRepository from '../../infrastructure/repositories/certifiable-profile-for-learning-content-repository.js';
import * as certificateRepository from '../../infrastructure/repositories/certificate-repository.js';
import * as certificationAssessmentRepository from '../../infrastructure/repositories/certification-assessment-repository.js';
import * as certificationAttestationPdf from '../../infrastructure/utils/pdf/certification-attestation-pdf.js';
import * as certificationBadgesService from '../../domain/services/certification-badges-service.js';
import * as certificationCandidateRepository from '../../infrastructure/repositories/certification-candidate-repository.js';
import * as certificationCandidateForSupervisingRepository from '../../infrastructure/repositories/certification-candidate-for-supervising-repository.js';
import * as certificationCandidatesOdsService from '../../domain/services/certification-candidates-ods-service.js';
import * as certificationCenterInvitationRepository from '../../infrastructure/repositories/certification-center-invitation-repository.js';
import * as certificationCenterInvitedUserRepository from '../../infrastructure/repositories/certification-center-invited-user-repository.js';
import * as certificationCenterMembershipRepository from '../../infrastructure/repositories/certification-center-membership-repository.js';
import * as certificationCenterForAdminRepository from '../../infrastructure/repositories/certification-center-for-admin-repository.js';
import * as certificationCenterRepository from '../../infrastructure/repositories/certification-center-repository.js';
import * as certificationChallengeRepository from '../../infrastructure/repositories/certification-challenge-repository.js';
import * as certificationChallengesService from '../../domain/services/certification-challenges-service.js';
import * as certificationCourseRepository from '../../infrastructure/repositories/certification-course-repository.js';
import * as certificationCpfCityRepository from '../../infrastructure/repositories/certification-cpf-city-repository.js';
import * as certificationCpfCountryRepository from '../../infrastructure/repositories/certification-cpf-country-repository.js';
import * as certificationIssueReportRepository from '../../infrastructure/repositories/certification-issue-report-repository.js';
import * as certificationLsRepository from '../../infrastructure/repositories/certification-livret-scolaire-repository.js';
import * as certificationOfficerRepository from '../../infrastructure/repositories/certification-officer-repository.js';
import * as certificationPointOfContactRepository from '../../infrastructure/repositories/certification-point-of-contact-repository.js';
import * as certificationReportRepository from '../../infrastructure/repositories/certification-report-repository.js';
import * as certificationRepository from '../../infrastructure/repositories/certification-repository.js';
import * as certificationCpfService from '../../domain/services/certification-cpf-service.js';
import * as certificationResultRepository from '../../infrastructure/repositories/certification-result-repository.js';
import * as challengeRepository from '../../infrastructure/repositories/challenge-repository.js';
import * as challengeForPixAutoAnswerRepository from '../../infrastructure/repositories/challenge-for-pix-auto-answer-repository.js';
import * as cleaCertifiedCandidateRepository from '../../infrastructure/repositories/clea-certified-candidate-repository.js';
import * as competenceEvaluationRepository from '../../infrastructure/repositories/competence-evaluation-repository.js';
import * as competenceMarkRepository from '../../infrastructure/repositories/competence-mark-repository.js';
import * as competenceRepository from '../../infrastructure/repositories/competence-repository.js';
import * as competenceTreeRepository from '../../infrastructure/repositories/competence-tree-repository.js';
import * as complementaryCertificationHabilitationRepository from '../../infrastructure/repositories/complementary-certification-habilitation-repository.js';
import * as complementaryCertificationRepository from '../../infrastructure/repositories/complementary-certification-repository.js';
import * as complementaryCertificationSubscriptionRepository from '../../infrastructure/repositories/complementary-certification-subscription-repository.js';
import * as complementaryCertificationCourseResultRepository from '../../infrastructure/repositories/complementary-certification-course-result-repository.js';
import * as correctionRepository from '../../infrastructure/repositories/correction-repository.js';
import * as countryRepository from '../../infrastructure/repositories/country-repository.js';
import * as courseRepository from '../../infrastructure/repositories/course-repository.js';
import * as cpfCertificationResultRepository from '../../infrastructure/repositories/cpf-certification-result-repository.js';
import * as dataProtectionOfficerRepository from '../../infrastructure/repositories/data-protection-officer-repository.js';
import * as divisionRepository from '../../infrastructure/repositories/division-repository.js';
import * as encryptionService from '../../domain/services/encryption-service.js';
import * as flashAssessmentResultRepository from '../../infrastructure/repositories/flash-assessment-result-repository.js';
import * as flashAlgorithmService from '../../domain/services/algorithm-methods/flash.js';
import * as frameworkRepository from '../../infrastructure/repositories/framework-repository.js';
import { getCompetenceLevel } from '../../domain/services/get-competence-level.js';
import * as sessionForSupervisorKitRepository from '../../infrastructure/repositories/sessions/session-for-supervisor-kit-repository.js';
import * as groupRepository from '../../infrastructure/repositories/group-repository.js';
import * as finalizedSessionRepository from '../../infrastructure/repositories/sessions/finalized-session-repository.js';
import * as supOrganizationLearnerRepository from '../../infrastructure/repositories/sup-organization-learner-repository.js';
import * as improvementService from '../../domain/services/improvement-service.js';
import * as issueReportCategoryRepository from '../../infrastructure/repositories/issue-report-category-repository.js';
import * as juryCertificationRepository from '../../infrastructure/repositories/jury-certification-repository.js';
import * as juryCertificationSummaryRepository from '../../infrastructure/repositories/jury-certification-summary-repository.js';
import * as jurySessionRepository from '../../infrastructure/repositories/sessions/jury-session-repository.js';
import * as knowledgeElementRepository from '../../infrastructure/repositories/knowledge-element-repository.js';
import * as learningContentRepository from '../../infrastructure/repositories/learning-content-repository.js';
import * as localeService from '../../domain/services/locale-service.js';
import * as mailService from '../../domain/services/mail-service.js';
import * as membershipRepository from '../../infrastructure/repositories/membership-repository.js';
import * as obfuscationService from '../../domain/services/obfuscation-service.js';
import * as organizationMemberIdentityRepository from '../../infrastructure/repositories/organization-member-identity-repository.js';
import * as organizationForAdminRepository from '../../infrastructure/repositories/organization-for-admin-repository.js';
import * as organizationFeatureRepository from '../../infrastructure/repositories/organizations-administration/organization-feature-repository.js';
import * as organizationRepository from '../../infrastructure/repositories/organization-repository.js';
import * as organizationPlacesLotRepository from '../../infrastructure/repositories/organizations/organization-places-lot-repository.js';
import * as organizationPlacesCapacityRepository from '../../infrastructure/repositories/organization-places-capacity-repository.js';
import * as organizationInvitationRepository from '../../infrastructure/repositories/organization-invitation-repository.js';
import * as organizationInvitedUserRepository from '../../infrastructure/repositories/organization-invited-user-repository.js';
import * as organizationTagRepository from '../../infrastructure/repositories/organization-tag-repository.js';
import * as organizationsToAttachToTargetProfileRepository from '../../infrastructure/repositories/organizations-to-attach-to-target-profile-repository.js';
import * as organizationLearnerFollowUpRepository from '../../infrastructure/repositories/organization-learner-follow-up/organization-learner-repository.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import * as organizationParticipantRepository from '../../infrastructure/repositories/organization-participant-repository.js';
import * as organizationLearnerActivityRepository from '../../infrastructure/repositories/organization-learner-activity-repository.js';
import * as organizationLearnersCsvService from '../../domain/services/organization-learners-csv-service.js';
import * as organizationLearnersXmlService from '../../domain/services/organization-learners-xml-service.js';
import * as participantResultRepository from '../../infrastructure/repositories/participant-result-repository.js';
import * as participationsForCampaignManagementRepository from '../../infrastructure/repositories/participations-for-campaign-management-repository.js';
import * as participationsForUserManagementRepository from '../../infrastructure/repositories/participations-for-user-management-repository.js';
import * as userOrganizationsForAdminRepository from '../../infrastructure/repositories/user-organizations-for-admin-repository.js';
import * as partnerCertificationScoringRepository from '../../infrastructure/repositories/partner-certification-scoring-repository.js';
import * as passwordGenerator from '../../domain/services/password-generator.js';
import * as pickChallengeService from '../services/pick-challenge-service.js';
import * as pixAuthenticationService from '../../domain/services/authentication/pix-authentication-service.js';
import * as placementProfileService from '../../domain/services/placement-profile-service.js';
import * as poleEmploiSendingRepository from '../../infrastructure/repositories/pole-emploi-sending-repository.js';
import * as prescriberRepository from '../../infrastructure/repositories/prescriber-repository.js';
import { pseudoRandom } from '../../infrastructure/utils/pseudo-random.js';
import * as resetPasswordService from '../../domain/services/reset-password-service.js';
import * as resetPasswordDemandRepository from '../../infrastructure/repositories/reset-password-demands-repository.js';
import * as scoAccountRecoveryService from '../services/sco-account-recovery-service.js';
import * as scoCertificationCandidateRepository from '../../infrastructure/repositories/sco-certification-candidate-repository.js';
import * as scoOrganizationParticipantRepository from '../../infrastructure/repositories/sco-organization-participant-repository.js';
import * as scorecardService from '../../domain/services/scorecard-service.js';
import * as scoringCertificationService from '../../domain/services/scoring/scoring-certification-service.js';
import * as supOrganizationParticipantRepository from '../../infrastructure/repositories/sup-organization-participant-repository.js';
import * as sessionForAttendanceSheetRepository from '../../infrastructure/repositories/sessions/session-for-attendance-sheet-repository.js';
import * as sessionsImportValidationService from '../../domain/services/sessions-mass-import/sessions-import-validation-service.js';
import * as sessionPublicationService from '../../domain/services/session-publication-service.js';
import * as sessionRepository from '../../infrastructure/repositories/sessions/session-repository.js';
import * as sessionForSupervisingRepository from '../../infrastructure/repositories/sessions/session-for-supervising-repository.js';
import * as sessionJuryCommentRepository from '../../infrastructure/repositories/sessions/session-jury-comment-repository.js';
import * as sessionSummaryRepository from '../../infrastructure/repositories/sessions/session-summary-repository.js';
import * as skillRepository from '../../infrastructure/repositories/skill-repository.js';
import * as skillSetRepository from '../../infrastructure/repositories/skill-set-repository.js';
import * as studentRepository from '../../infrastructure/repositories/student-repository.js';
import * as supervisorAccessRepository from '../../infrastructure/repositories/supervisor-access-repository.js';
import * as tagRepository from '../../infrastructure/repositories/tag-repository.js';
import * as TargetProfileForSpecifierRepository from '../../infrastructure/repositories/campaign/target-profile-for-specifier-repository.js';
import * as targetProfileRepository from '../../infrastructure/repositories/target-profile-repository.js';
import * as targetProfileSummaryForAdminRepository from '../../infrastructure/repositories/target-profile-summary-for-admin-repository.js';
import * as targetProfileForUpdateRepository from '../../infrastructure/repositories/target-profile-for-update-repository.js';
import * as targetProfileShareRepository from '../../infrastructure/repositories/target-profile-share-repository.js';
import * as targetProfileForAdminRepository from '../../infrastructure/repositories/target-profile-for-admin-repository.js';
import * as targetProfileTrainingRepository from '../../infrastructure/repositories/target-profile-training-repository.js';
import * as thematicRepository from '../../infrastructure/repositories/thematic-repository.js';
import { tokenService } from '../../domain/services/token-service.js';
import * as refreshTokenService from '../../domain/services/refresh-token-service.js';
import * as trainingRepository from '../../infrastructure/repositories/training-repository.js';
import * as trainingTriggerRepository from '../../infrastructure/repositories/training-trigger-repository.js';
import * as tubeRepository from '../../infrastructure/repositories/tube-repository.js';
import * as tutorialEvaluationRepository from '../../infrastructure/repositories/tutorial-evaluation-repository.js';
import * as tutorialRepository from '../../infrastructure/repositories/tutorial-repository.js';
import * as userEmailRepository from '../../infrastructure/repositories/user-email-repository.js';
import * as userLoginRepository from '../../infrastructure/repositories/user-login-repository.js';
import * as userOrgaSettingsRepository from '../../infrastructure/repositories/user-orga-settings-repository.js';
import * as userRecommendedTrainingRepository from '../../infrastructure/repositories/user-recommended-training-repository.js';
import * as userReconciliationService from '../services/user-reconciliation-service.js';
import * as userToCreateRepository from '../../infrastructure/repositories/user-to-create-repository.js';
import * as userRepository from '../../infrastructure/repositories/user-repository.js';
import * as userService from '../../domain/services/user-service.js';
import * as userSavedTutorialRepository from '../../infrastructure/repositories/user-saved-tutorial-repository.js';
import * as verifyCertificateCodeService from '../../domain/services/verify-certificate-code-service.js';
import * as participantResultsSharedRepository from '../../infrastructure/repositories/participant-results-shared-repository.js';
import * as poleEmploiNotifier from '../../infrastructure/externals/pole-emploi/pole-emploi-notifier.js';
import * as disabledPoleEmploiNotifier from '../../infrastructure/externals/pole-emploi/disabled-pole-emploi-notifier.js';
import * as organizationInvitationService from '../services/organization-invitation-service.js';
import * as organizationCreationValidator from '../validators/organization-creation-validator.js';
import * as organizationValidator from '../validators/organization-with-tags-and-target-profiles-script.js';
import * as userValidator from '../validators/user-validator.js';
import * as passwordValidator from '../validators/password-validator.js';
import * as stageCollectionRepository from '../../infrastructure/repositories/user-campaign-results/stage-collection-repository.js';
import * as campaignValidator from '../validators/campaign-validator.js';
import * as learningContentConversionService from '../services/learning-content/learning-content-conversion-service.js';
import * as temporarySessionsStorageForMassImportService from '../services/sessions-mass-import/temporary-sessions-storage-for-mass-import-service.js';
import * as sessionValidator from '../validators/session-validator.js';
import * as sessionCodeService from '../services/session-code-service.js';
import * as dateUtils from '../../infrastructure/utils/date-utils.js';
import * as campaignCodeGenerator from '../services/campaigns/campaign-code-generator.js';
import * as smartRandom from '../../domain/services/algorithm-methods/smart-random.js';
import * as codeUtils from '../../infrastructure/utils/code-utils.js';
import * as writeOdsUtils from '../../infrastructure/utils/ods/write-ods-utils.js';
import * as readOdsUtils from '../../infrastructure/utils/ods/read-ods-utils.js';
import * as sessionXmlService from '../../domain/services/session-xml-service.js';

function requirePoleEmploiNotifier() {
  if (config.poleEmploi.pushEnabled) {
    return poleEmploiNotifier;
  } else {
    return disabledPoleEmploiNotifier;
  }
}

const dependencies = {
  accountRecoveryDemandRepository,
  adminMemberRepository,
  algorithmDataFetcherService,
  answerRepository,
  areaRepository,
  assessmentRepository,
  assessmentResultRepository,
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
  campaignCreatorRepository,
  campaignCodeGenerator,
  campaignForArchivingRepository,
  campaignParticipantActivityRepository,
  campaignCollectiveResultRepository,
  campaignManagementRepository,
  campaignParticipationInfoRepository,
  campaignParticipantRepository,
  campaignParticipationOverviewRepository,
  campaignParticipationRepository,
  campaignParticipationResultRepository,
  campaignParticipationsStatsRepository,
  campaignProfilesCollectionParticipationSummaryRepository,
  campaignProfileRepository,
  campaignReportRepository,
  campaignRepository,
  campaignToJoinRepository,
  campaignCsvExportService,
  certifiableProfileForLearningContentRepository,
  certificateRepository,
  certificationAssessmentRepository,
  certificationAttestationPdf,
  certificationBadgesService,
  certificationCandidateRepository,
  certificationCandidateForSupervisingRepository,
  certificationCandidatesOdsService,
  certificationCenterInvitationRepository,
  certificationCenterInvitedUserRepository,
  certificationCenterMembershipRepository,
  certificationCenterForAdminRepository,
  certificationCenterRepository,
  certificationChallengeRepository,
  certificationChallengesService,
  certificationCourseRepository,
  certificationCpfCityRepository,
  certificationCpfCountryRepository,
  certificationIssueReportRepository,
  certificationLsRepository,
  certificationOfficerRepository,
  certificationPointOfContactRepository,
  certificationReportRepository,
  certificationRepository,
  certificationCpfService,
  certificationResultRepository,
  challengeRepository,
  challengeForPixAutoAnswerRepository,
  cleaCertifiedCandidateRepository,
  codeUtils,
  competenceEvaluationRepository,
  competenceMarkRepository,
  competenceRepository,
  competenceTreeRepository,
  complementaryCertificationHabilitationRepository,
  complementaryCertificationRepository,
  complementaryCertificationSubscriptionRepository,
  complementaryCertificationCourseResultRepository,
  correctionRepository,
  countryRepository,
  courseRepository,
  cpfCertificationResultRepository,
  dataProtectionOfficerRepository,
  dateUtils,
  dataFetcher,
  divisionRepository,
  encryptionService,
  flashAssessmentResultRepository,
  flashAlgorithmService,
  frameworkRepository,
  getCompetenceLevel,
  sessionForSupervisorKitRepository,
  groupRepository,
  finalizedSessionRepository,
  supOrganizationLearnerRepository,
  improvementService,
  issueReportCategoryRepository,
  juryCertificationRepository,
  juryCertificationSummaryRepository,
  jurySessionRepository,
  knowledgeElementRepository,
  learningContentRepository,
  localeService,
  mailService,
  membershipRepository,
  obfuscationService,
  organizationMemberIdentityRepository,
  organizationForAdminRepository,
  organizationRepository,
  organizationFeatureRepository,
  organizationPlacesLotRepository,
  organizationPlacesCapacityRepository,
  organizationInvitationRepository,
  organizationInvitedUserRepository,
  organizationTagRepository,
  organizationsToAttachToTargetProfileRepository,
  organizationLearnerFollowUpRepository,
  organizationLearnerRepository,
  organizationParticipantRepository,
  organizationLearnerActivityRepository,
  organizationLearnersCsvService,
  organizationLearnersXmlService,
  participantResultRepository,
  participantResultsSharedRepository,
  participationsForCampaignManagementRepository,
  participationsForUserManagementRepository,
  userOrganizationsForAdminRepository,
  partnerCertificationScoringRepository,
  passwordGenerator,
  pickChallengeService,
  pixAuthenticationService,
  placementProfileService,
  poleEmploiSendingRepository,
  poleEmploiNotifier: requirePoleEmploiNotifier(),
  prescriberRepository,
  resetPasswordService,
  resetPasswordDemandRepository,
  scoAccountRecoveryService,
  scoCertificationCandidateRepository,
  scoOrganizationParticipantRepository,
  scorecardService,
  scoringCertificationService,
  supOrganizationParticipantRepository,
  sessionForAttendanceSheetRepository,
  sessionsImportValidationService,
  sessionPublicationService,
  sessionCodeService,
  sessionRepository,
  sessionForSupervisingRepository,
  sessionJuryCommentRepository,
  sessionSummaryRepository,
  sessionValidator,
  smartRandom,
  pseudoRandom,
  readOdsUtils,
  sessionXmlService,
  config,
  skillRepository,
  skillSetRepository,
  studentRepository,
  supervisorAccessRepository,
  tagRepository,
  TargetProfileForSpecifierRepository,
  targetProfileRepository,
  targetProfileSummaryForAdminRepository,
  targetProfileForUpdateRepository,
  targetProfileShareRepository,
  targetProfileForAdminRepository,
  targetProfileTrainingRepository,
  thematicRepository,
  tokenService,
  refreshTokenService,
  trainingRepository,
  trainingTriggerRepository,
  tubeRepository,
  tutorialEvaluationRepository,
  tutorialRepository,
  userEmailRepository,
  userLoginRepository,
  userOrgaSettingsRepository,
  userRecommendedTrainingRepository,
  userReconciliationService,
  userToCreateRepository,
  userRepository,
  userService,
  userSavedTutorialRepository,
  verifyCertificateCodeService,
  organizationInvitationService,
  organizationCreationValidator,
  organizationValidator,
  userValidator,
  passwordValidator,
  stageCollectionRepository,
  campaignValidator,
  learningContentConversionService,
  temporarySessionsStorageForMassImportService,
  writeOdsUtils,
};

import { injectDependencies } from '../../infrastructure/utils/dependency-injection.js';
import { abortCertificationCourse } from './abort-certification-course.js';
import { acceptCertificationCenterInvitation } from './accept-certification-center-invitation.js';
import { acceptOrganizationInvitation } from './accept-organization-invitation.js';
import * as acceptPixCertifTermsOfService from './accept-pix-certif-terms-of-service.js';
import * as acceptPixLastTermsOfService from './accept-pix-last-terms-of-service.js';
import * as acceptPixOrgaTermsOfService from './accept-pix-orga-terms-of-service.js';
import { addCertificationCandidateToSession } from './add-certification-candidate-to-session.js';
import { addPixAuthenticationMethodByEmail } from './add-pix-authentication-method-by-email.js';
import { addTutorialEvaluation } from './add-tutorial-evaluation.js';
import { addTutorialToUser } from './add-tutorial-to-user.js';
import { anonymizeUser } from './anonymize-user.js';
import { archiveCampaign } from './archive-campaign.js';
import { archiveOrganization } from './archive-organization.js';
import { assignCertificationOfficerToJurySession } from './assign-certification-officer-to-jury-session.js';
import { attachOrganizationsFromExistingTargetProfile } from './attach-organizations-from-existing-target-profile.js';
import { attachOrganizationsToTargetProfile } from './attach-organizations-to-target-profile.js';
import { attachTargetProfilesToOrganization } from './attach-target-profiles-to-organization.js';
import { attachTargetProfilesToTraining } from './attach-target-profiles-to-training.js';
import { authenticateAnonymousUser } from './authenticate-anonymous-user.js';
import { authenticateApplication } from './authenticate-application.js';
import { authenticateExternalUser } from './authenticate-external-user.js';
import { authenticateOidcUser } from './authentication/authenticate-oidc-user.js';
import { authenticateUser } from './authenticate-user.js';
import { authorizeCertificationCandidateToResume } from './authorize-certification-candidate-to-resume.js';
import { authorizeCertificationCandidateToStart } from './authorize-certification-candidate-to-start.js';
import { beginCampaignParticipationImprovement } from './begin-campaign-participation-improvement.js';
import { archiveCampaigns } from './campaigns-administration/archive-campaigns.js';
import { cancelCertificationCenterInvitation } from './cancel-certification-center-invitation.js';
import { cancelCertificationCourse } from './cancel-certification-course.js';
import { cancelOrganizationInvitation } from './cancel-organization-invitation.js';
import { changeUserLang } from './change-user-lang.js';
import { checkScoAccountRecovery } from './check-sco-account-recovery.js';
import { commentSessionAsJury } from './comment-session-as-jury.js';
import { completeAssessment } from './complete-assessment.js';
import { computeCampaignAnalysis } from './compute-campaign-analysis.js';
import { computeCampaignCollectiveResult } from './compute-campaign-collective-result.js';
import { computeCampaignParticipationAnalysis } from './compute-campaign-participation-analysis.js';
import { correctAnswerThenUpdateAssessment } from './correct-answer-then-update-assessment.js';
import { correctAnswer } from './correct-answer.js';
import { correctCandidateIdentityInCertificationCourse } from './correct-candidate-identity-in-certification-course.js';
import { createAccessTokenFromRefreshToken } from './create-access-token-from-refresh-token.js';
import { createAndReconcileUserToOrganizationLearner } from './create-and-reconcile-user-to-organization-learner.js';
import { createBadge } from './create-badge.js';
import { createCampaign } from './create-campaign.js';
import { createCertificationCenter } from './create-certification-center.js';
import { createCertificationCenterMembershipByEmail } from './create-certification-center-membership-by-email.js';
import { createCertificationCenterMembershipForScoOrganizationMember } from './create-certification-center-membership-for-sco-organization-member.js';
import { createLcmsRelease } from './create-lcms-release.js';
import { createMembership } from './create-membership.js';
import { createOidcUser } from './create-oidc-user.js';
import { createOrUpdateCertificationCenterInvitationForAdmin } from './create-or-update-certification-center-invitation-for-admin.js';
import { createOrUpdateTrainingTrigger } from './create-or-update-training-trigger.js';
import { createOrUpdateUserOrgaSettings } from './create-or-update-user-orga-settings.js';
import { createOrganization } from './create-organization.js';
import { createOrganizationInvitationByAdmin } from './create-organization-invitation-by-admin.js';
import { createOrganizationInvitations } from './create-organization-invitations.js';
import { resendOrganizationInvitation } from './resend-organization-invitation.js';
import { createOrganizationPlacesLot } from './create-organization-places-lot.js';
import { createOrganizationsWithTagsAndTargetProfiles } from './create-organizations-with-tags-and-target-profiles.js';
import { createPasswordResetDemand } from './create-password-reset-demand.js';
import { createSession } from './create-session.js';
import { createSessions } from './sessions-mass-import/create-sessions.js';
import { createTag } from './create-tag.js';
import { createTargetProfile } from './create-target-profile.js';
import { createTraining } from './create-training.js';
import { createUser } from './create-user.js';
import { createUserAndReconcileToOrganizationLearnerFromExternalUser } from './create-user-and-reconcile-to-organization-learner-from-external-user.js';
import { deactivateAdminMember } from './deactivate-admin-member.js';
import { deleteCampaignParticipation } from './delete-campaign-participation.js';
import { deleteCampaignParticipationForAdmin } from './delete-campaign-participation-for-admin.js';
import { deleteCertificationIssueReport } from './delete-certification-issue-report.js';
import { deleteOrganizationPlaceLot } from './delete-organization-place-lot.js';
import { deleteSession } from './delete-session.js';
import { deleteSessionJuryComment } from './delete-session-jury-comment.js';
import { deleteUnassociatedBadge } from './delete-unassociated-badge.js';
import { deleteUnlinkedCertificationCandidate } from './delete-unlinked-certification-candidate.js';
import { deneutralizeChallenge } from './deneutralize-challenge.js';
import { disableCertificationCenterMembership } from './disable-certification-center-membership.js';
import { disableMembership } from './disable-membership.js';
import { dissociateUserFromOrganizationLearner } from './dissociate-user-from-organization-learner.js';
import { endAssessmentBySupervisor } from './end-assessment-by-supervisor.js';
import { enrolStudentsToSession } from './enrol-students-to-session.js';
import { finalizeSession } from './finalize-session.js';
import { findAllTags } from './find-all-tags.js';
import { findAnswerByAssessment } from './find-answer-by-assessment.js';
import { findAnswerByChallengeAndAssessment } from './find-answer-by-challenge-and-assessment.js';
import { findAssessmentParticipationResultList } from './find-assessment-participation-result-list.js';
import { findAssociationBetweenUserAndOrganizationLearner } from './find-association-between-user-and-organization-learner.js';
import { findCampaignParticipationTrainings } from './find-campaign-participation-trainings.js';
import { findCampaignParticipationsForUserManagement } from './find-campaign-participations-for-user-management.js';
import { findCampaignProfilesCollectionParticipationSummaries } from './find-campaign-profiles-collection-participation-summaries.js';
import { findCertificationAttestationsForDivision } from './certificate/find-certification-attestations-for-division.js';
import { findCertificationCenterMembershipsByCertificationCenter } from './find-certification-center-memberships-by-certification-center.js';
import { findCertificationCenterMembershipsByUser } from './find-certification-center-memberships-by-user.js';
import { findCompetenceEvaluationsByAssessment } from './find-competence-evaluations-by-assessment.js';
import { findComplementaryCertifications } from './find-complementary-certifications.js';
import { findCountries } from './find-countries.js';
import { findDivisionsByCertificationCenter } from './find-divisions-by-certification-center.js';
import { findDivisionsByOrganization } from './find-divisions-by-organization.js';
import { findFinalizedSessionsToPublish } from './find-finalized-sessions-to-publish.js';
import { findFinalizedSessionsWithRequiredAction } from './find-finalized-sessions-with-required-action.js';
import { findGroupByOrganization } from './find-groups-by-organization.js';
import { findLatestOngoingUserCampaignParticipations } from './find-latest-ongoing-user-campaign-participations.js';
import { findOrganizationPlacesLot } from './find-organization-places-lot.js';
import { findOrganizationTargetProfileSummariesForAdmin } from './find-organization-target-profile-summaries-for-admin.js';
import { findPaginatedCampaignManagements } from './find-paginated-campaign-managements.js';
import { findPaginatedCampaignParticipantsActivities } from './find-paginated-campaign-participants-activities.js';
import { findPaginatedCertificationCenterSessionSummaries } from './find-paginated-certification-center-session-summaries.js';
import { findPaginatedFilteredCertificationCenters } from './find-paginated-filtered-certification-centers.js';
import { findPaginatedFilteredOrganizationCampaigns } from './find-paginated-filtered-organization-campaigns.js';
import { findPaginatedFilteredOrganizationMemberships } from './find-paginated-filtered-organization-memberships.js';
import { findPaginatedFilteredOrganizations } from './find-paginated-filtered-organizations.js';
import { findPaginatedFilteredScoParticipants } from './find-paginated-filtered-sco-participants.js';
import { findPaginatedFilteredSupParticipants } from './find-paginated-filtered-sup-participants.js';
import { findTargetProfileOrganizations as findPaginatedFilteredTargetProfileOrganizations } from './find-paginated-filtered-target-profile-organizations.js';
import { findPaginatedFilteredTargetProfileSummariesForAdmin } from './find-paginated-filtered-target-profile-summaries-for-admin.js';
import { findPaginatedFilteredTutorials } from './find-paginated-filtered-tutorials.js';
import { findPaginatedFilteredUsers } from './find-paginated-filtered-users.js';
import { findPaginatedParticipationsForCampaignManagement } from './find-paginated-participations-for-campaign-management.js';
import { findPaginatedTargetProfileTrainingSummaries } from './find-paginated-target-profile-training-summaries.js';
import { findPaginatedTrainingSummaries } from './find-paginated-training-summaries.js';
import { findPaginatedUserRecommendedTrainings } from './find-paginated-user-recommended-trainings.js';
import { findPendingCertificationCenterInvitations } from './find-pending-certification-center-invitations.js';
import { findPendingOrganizationInvitations } from './find-pending-organization-invitations.js';
import { findStudentsForEnrolment } from './find-students-for-enrolment.js';
import { findTargetProfileSummariesForTraining } from './find-target-profile-summaries-for-training.js';
import { findTutorials } from './find-tutorials.js';
import { findUserAuthenticationMethods } from './find-user-authentication-methods.js';
import { findUserCampaignParticipationOverviews } from './find-user-campaign-participation-overviews.js';
import { findUserForOidcReconciliation } from './find-user-for-oidc-reconciliation.js';
import { findUserOrganizationsForAdmin } from './find-user-organizations-for-admin.js';
import { findUserPrivateCertificates } from './find-user-private-certificates.js';
import { flagSessionResultsAsSentToPrescriber } from './flag-session-results-as-sent-to-prescriber.js';
import { generateUsername } from './generate-username.js';
import { generateUsernameWithTemporaryPassword } from './generate-username-with-temporary-password.js';
import { getAccountRecoveryDetails } from './account-recovery/get-account-recovery-details.js';
import { getAdminMemberDetails } from './get-admin-member-details.js';
import { getAdminMembers } from './get-admin-members.js';
import { getAnswer } from './get-answer.js';
import { getAssessment } from './get-assessment.js';
import { getAttendanceSheet } from './get-attendance-sheet.js';
import { getAvailableTargetProfilesForOrganization } from './get-available-target-profiles-for-organization.js';
import { getCampaign } from './get-campaign.js';
import { getCampaignAssessmentParticipation } from './get-campaign-assessment-participation.js';
import { getCampaignAssessmentParticipationResult } from './get-campaign-assessment-participation-result.js';
import { getCampaignByCode } from './get-campaign-by-code.js';
import { getCampaignManagement as getCampaignDetailsManagement } from './get-campaign-details-management.js';
import { getCampaignParticipationsActivityByDay } from './get-campaign-participations-activity-by-day.js';
import { getCampaignParticipationsCountByStage } from './get-campaign-participations-counts-by-stage.js';
import { getCampaignParticipationsCountsByStatus } from './get-campaign-participations-counts-by-status.js';
import { getCampaignProfile } from './get-campaign-profile.js';
import { getCandidateImportSheetData } from './get-candidate-import-sheet-data.js';
import { getCertificationAttestation } from './certificate/get-certification-attestation.js';
import { getCertificationCandidate } from './get-certification-candidate.js';
import { getCertificationCandidateSubscription } from './get-certification-candidate-subscription.js';
import { getCertificationCenter } from './get-certification-center.js';
import { getCertificationCenterForAdmin } from './get-certification-center-for-admin.js';
import { getCertificationCenterInvitation } from './get-certification-center-invitation.js';
import { getCertificationCourse } from './get-certification-course.js';
import { getCertificationDetails } from './get-certification-details.js';
import { getCertificationPointOfContact } from './get-certification-point-of-contact.js';
import { getCertificationsResultsForLS } from './certificate/get-certifications-results-for-ls.js';
import { getChallengeForPixAutoAnswer } from './get-challenge-for-pix-auto-answer.js';
import { getCleaCertifiedCandidateBySession } from './get-clea-certified-candidate-by-session.js';
import { getCorrectionForAnswer } from './get-correction-for-answer.js';
import { getCurrentUser } from './get-current-user.js';
import { getExternalAuthenticationRedirectionUrl } from './get-external-authentication-redirection-url.js';
import { getFrameworkAreas } from './get-framework-areas.js';
import { getFrameworks } from './get-frameworks.js';
import { getIdentityProviders } from './get-identity-providers.js';
import { getImportSessionComplementaryCertificationHabilitationsLabels } from './get-import-session-complementary-certification-habilitations-labels.js';
import { getJuryCertification } from './get-jury-certification.js';
import { getJurySession } from './get-jury-session.js';
import { getLastChallengeIdFromAssessmentId } from './get-last-challenge-id-from-assessment-id.js';
import { getLearningContentByTargetProfile } from './get-learning-content-by-target-profile.js';
import { getLearningContentForTargetProfileSubmission } from './get-learning-content-for-target-profile-submission.js';
import { getNextChallengeForCampaignAssessment } from './get-next-challenge-for-campaign-assessment.js';
import { getNextChallengeForCertification } from './get-next-challenge-for-certification.js';
import { getNextChallengeForCompetenceEvaluation } from './get-next-challenge-for-competence-evaluation.js';
import { getNextChallengeForDemo } from './get-next-challenge-for-demo.js';
import { getNextChallengeForPreview } from './get-next-challenge-for-preview.js';
import { getOrganizationInvitation } from './get-organization-invitation.js';
import { getOrganizationLearner } from './get-organization-learner.js';
import { getOrganizationLearnerActivity } from './get-organization-learner-activity.js';
import { getOrganizationLearnersCsvTemplate } from './get-organization-learners-csv-template.js';
import { getOrganizationMemberIdentities } from './get-organization-members-identity.js';
import { getOrganizationPlacesCapacity } from './get-organization-places-capacity.js';
import { getPaginatedParticipantsForAnOrganization } from './get-paginated-participants-for-an-organization.js';
import { getParticipantsDivision } from './get-participants-division.js';
import { getParticipantsGroup } from './get-participants-group.js';
import { getParticipationsCountByMasteryRate } from './get-participations-count-by-mastery-rate.js';
import { getPoleEmploiSendings } from './get-pole-emploi-sendings.js';
import { getPrescriber } from './get-prescriber.js';
import { getPrivateCertificate } from './certificate/get-private-certificate.js';
import { getProgression } from './get-progression.js';
import { getRecentlyUsedTags } from './get-recently-used-tags.js';
import { getScoCertificationResultsByDivision } from './get-sco-certification-results-by-division.js';
import { getScorecard } from './get-scorecard.js';
import { getSession } from './get-session.js';
import { getSessionCertificationCandidates } from './get-session-certification-candidates.js';
import { getSessionCertificationReports } from './get-session-certification-reports.js';
import { getSessionForSupervising } from './get-session-for-supervising.js';
import { getSessionResults } from './get-session-results.js';
import { getSessionResultsByResultRecipientEmail } from './get-session-results-by-result-recipient-email.js';
import { getShareableCertificate } from './certificate/get-shareable-certificate.js';
import { getSupervisorKitSessionInfo } from './get-supervisor-kit-session-info.js';
import { getTargetProfileContentAsJson } from './get-target-profile-content-as-json.js';
import { getTargetProfileForAdmin } from './get-target-profile-for-admin.js';
import { getTraining } from './get-training.js';
import { getUserByResetPasswordDemand } from './get-user-by-reset-password-demand.js';
import { getUserCampaignAssessmentResult } from './get-user-campaign-assessment-result.js';
import { getUserCampaignParticipationToCampaign } from './get-user-campaign-participation-to-campaign.js';
import { getUserCertificationEligibility } from './get-user-certification-eligibility.js';
import { getUserDetailsForAdmin } from './get-user-details-for-admin.js';
import { getUserProfile } from './get-user-profile.js';
import { getUserProfileSharedForCampaign } from './get-user-profile-shared-for-campaign.js';
import { handleBadgeAcquisition } from './handle-badge-acquisition.js';
import { handleTrainingRecommendation } from './handle-training-recommendation.js';
import { importCertificationCandidatesFromCandidatesImportSheet } from './import-certification-candidates-from-candidates-import-sheet.js';
import { importOrganizationLearnersFromSIECLEFormat } from './import-organization-learners-from-siecle.js';
import { importSupOrganizationLearners } from './import-sup-organization-learners.js';
import { improveCompetenceEvaluation } from './improve-competence-evaluation.js';
import { linkUserToSessionCertificationCandidate } from './link-user-to-session-certification-candidate.js';
import { manuallyResolveCertificationIssueReport } from './manually-resolve-certification-issue-report.js';
import { markTargetProfileAsSimplifiedAccess } from './mark-target-profile-as-simplified-access.js';
import { neutralizeChallenge } from './neutralize-challenge.js';
import { outdateTargetProfile } from './outdate-target-profile.js';
import { publishSession } from './publish-session.js';
import { publishSessionsInBatch } from './publish-sessions-in-batch.js';
import { reassignAuthenticationMethodToAnotherUser } from './reassign-authentication-method-to-another-user.js';
import { reconcileOidcUser } from './reconcile-oidc-user.js';
import { reconcileScoOrganizationLearnerAutomatically } from './reconcile-sco-organization-learner-automatically.js';
import { reconcileScoOrganizationLearnerManually } from './reconcile-sco-organization-learner-manually.js';
import { reconcileSupOrganizationLearner } from './reconcile-sup-organization-learner.js';
import { rememberUserHasSeenAssessmentInstructions } from './remember-user-has-seen-assessment-instructions.js';
import { rememberUserHasSeenChallengeTooltip } from './remember-user-has-seen-challenge-tooltip.js';
import { rememberUserHasSeenLastDataProtectionPolicyInformation } from './remember-user-has-seen-last-data-protection-policy-information.js';
import { rememberUserHasSeenNewDashboardInfo } from './remember-user-has-seen-new-dashboard-info.js';
import { removeAuthenticationMethod } from './remove-authentication-method.js';
import { replaceSupOrganizationLearners } from './replace-sup-organization-learner.js';
import { resetScorecard } from './reset-scorecard.js';
import { retrieveLastOrCreateCertificationCourse } from './retrieve-last-or-create-certification-course.js';
import { revokeRefreshToken } from './revoke-refresh-token.js';
import { saveAdminMember } from './save-admin-member.js';
import { saveCertificationIssueReport } from './save-certification-issue-report.js';
import { saveComputedCampaignParticipationResult } from './save-computed-campaign-participation-result.js';
import { saveJuryComplementaryCertificationCourseResult } from './save-jury-complementary-certification-course-result.js';
import { sendEmailForAccountRecovery } from './account-recovery/send-email-for-account-recovery.js';
import { sendScoInvitation } from './send-sco-invitation.js';
import { sendSharedParticipationResultsToPoleEmploi } from './send-shared-participation-results-to-pole-emploi.js';
import { sendVerificationCode } from './send-verification-code.js';
import { shareCampaignResult } from './share-campaign-result.js';
import { simulateFlashScoring } from './simulate-flash-scoring.js';
import { simulateOldScoring } from './simulate-old-scoring.js';
import { startCampaignParticipation } from './start-campaign-participation.js';
import { startOrResumeCompetenceEvaluation } from './start-or-resume-competence-evaluation.js';
import { startWritingCampaignAssessmentResultsToStream } from './start-writing-campaign-assessment-results-to-stream.js';
import { startWritingCampaignProfilesCollectionResultsToStream } from './start-writing-campaign-profiles-collection-results-to-stream.js';
import { superviseSession } from './supervise-session.js';
import { unarchiveCampaign } from './unarchive-campaign.js';
import { unblockUserAccount } from './unblock-user-account.js';
import { uncancelCertificationCourse } from './uncancel-certification-course.js';
import { unpublishSession } from './unpublish-session.js';
import { updateAdminMember } from './update-admin-member.js';
import { updateBadge } from './update-badge.js';
import { updateCampaign } from './update-campaign.js';
import { updateCampaignDetailsManagement } from './update-campaign-details-management.js';
import { updateCertificationCenter } from './update-certification-center.js';
import { updateCertificationCenterReferer } from './update-certification-center-referer.js';
import { updateExpiredPassword } from './update-expired-password.js';
import { updateLastQuestionState } from './update-last-question-state.js';
import { updateMembership } from './update-membership.js';
import { updateOrganizationLearnerDependentUserPassword } from './update-organization-learner-dependent-user-password.js';
import { updateParticipantExternalId } from './update-participant-external-id.js';
import { updateSession } from './update-session.js';
import { updateStudentNumber } from './update-student-number.js';
import { updateTargetProfile } from './update-target-profile.js';
import { updateTraining } from './update-training.js';
import { updateUserDetailsForAdministration } from './update-user-details-for-administration.js';
import { updateUserEmailWithValidation } from './update-user-email-with-validation.js';
import { updateUserForAccountRecovery } from './account-recovery/update-user-for-account-recovery.js';
import { updateUserPassword } from './update-user-password.js';
import { validateSessions } from './sessions-mass-import/validate-sessions.js';
import { getOrganizationDetails } from './organizations-administration/get-organization-details.js';
import { updateOrganizationInformation } from './organizations-administration/update-organization.js';

const usecasesWithoutInjectedDependencies = {
  abortCertificationCourse,
  acceptCertificationCenterInvitation,
  acceptOrganizationInvitation,
  acceptPixCertifTermsOfService,
  acceptPixLastTermsOfService,
  acceptPixOrgaTermsOfService,
  addCertificationCandidateToSession,
  addPixAuthenticationMethodByEmail,
  addTutorialEvaluation,
  addTutorialToUser,
  anonymizeUser,
  archiveCampaign,
  archiveOrganization,
  assignCertificationOfficerToJurySession,
  attachOrganizationsFromExistingTargetProfile,
  attachOrganizationsToTargetProfile,
  attachTargetProfilesToOrganization,
  attachTargetProfilesToTraining,
  authenticateAnonymousUser,
  authenticateApplication,
  authenticateExternalUser,
  authenticateOidcUser,
  authenticateUser,
  authorizeCertificationCandidateToResume,
  authorizeCertificationCandidateToStart,
  beginCampaignParticipationImprovement,
  archiveCampaigns,
  cancelCertificationCenterInvitation,
  cancelCertificationCourse,
  cancelOrganizationInvitation,
  changeUserLang,
  checkScoAccountRecovery,
  commentSessionAsJury,
  completeAssessment,
  computeCampaignAnalysis,
  computeCampaignCollectiveResult,
  computeCampaignParticipationAnalysis,
  correctAnswer,
  correctAnswerThenUpdateAssessment,
  correctCandidateIdentityInCertificationCourse,
  createAccessTokenFromRefreshToken,
  createAndReconcileUserToOrganizationLearner,
  createBadge,
  createCampaign,
  createCertificationCenter,
  createCertificationCenterMembershipByEmail,
  createCertificationCenterMembershipForScoOrganizationMember,
  createLcmsRelease,
  createMembership,
  createOidcUser,
  createOrUpdateCertificationCenterInvitationForAdmin,
  createOrUpdateTrainingTrigger,
  createOrUpdateUserOrgaSettings,
  createOrganization,
  createOrganizationInvitationByAdmin,
  createOrganizationInvitations,
  resendOrganizationInvitation,
  createOrganizationPlacesLot,
  createOrganizationsWithTagsAndTargetProfiles,
  createPasswordResetDemand,
  createSession,
  createSessions,
  createTag,
  createTargetProfile,
  createTraining,
  createUser,
  createUserAndReconcileToOrganizationLearnerFromExternalUser,
  deactivateAdminMember,
  deleteCampaignParticipation,
  deleteCampaignParticipationForAdmin,
  deleteCertificationIssueReport,
  deleteOrganizationPlaceLot,
  deleteSession,
  deleteSessionJuryComment,
  deleteUnassociatedBadge,
  deleteUnlinkedCertificationCandidate,
  deneutralizeChallenge,
  disableCertificationCenterMembership,
  disableMembership,
  dissociateUserFromOrganizationLearner,
  endAssessmentBySupervisor,
  enrolStudentsToSession,
  finalizeSession,
  findAllTags,
  findAnswerByAssessment,
  findAnswerByChallengeAndAssessment,
  findAssessmentParticipationResultList,
  findAssociationBetweenUserAndOrganizationLearner,
  findCampaignParticipationTrainings,
  findCampaignParticipationsForUserManagement,
  findCampaignProfilesCollectionParticipationSummaries,
  findCertificationAttestationsForDivision,
  findCertificationCenterMembershipsByCertificationCenter,
  findCertificationCenterMembershipsByUser,
  findCompetenceEvaluationsByAssessment,
  findComplementaryCertifications,
  findCountries,
  findDivisionsByCertificationCenter,
  findDivisionsByOrganization,
  findFinalizedSessionsToPublish,
  findFinalizedSessionsWithRequiredAction,
  findGroupByOrganization,
  findLatestOngoingUserCampaignParticipations,
  findOrganizationPlacesLot,
  findOrganizationTargetProfileSummariesForAdmin,
  findPaginatedCampaignManagements,
  findPaginatedCampaignParticipantsActivities,
  findPaginatedCertificationCenterSessionSummaries,
  findPaginatedFilteredCertificationCenters,
  findPaginatedFilteredOrganizationCampaigns,
  findPaginatedFilteredOrganizationMemberships,
  findPaginatedFilteredOrganizations,
  findPaginatedFilteredScoParticipants,
  findPaginatedFilteredSupParticipants,
  findPaginatedFilteredTargetProfileOrganizations,
  findPaginatedFilteredTargetProfileSummariesForAdmin,
  findPaginatedFilteredTutorials,
  findPaginatedFilteredUsers,
  findPaginatedParticipationsForCampaignManagement,
  findPaginatedTargetProfileTrainingSummaries,
  findPaginatedTrainingSummaries,
  findPaginatedUserRecommendedTrainings,
  findPendingCertificationCenterInvitations,
  findPendingOrganizationInvitations,
  findStudentsForEnrolment,
  findTargetProfileSummariesForTraining,
  findTutorials,
  findUserAuthenticationMethods,
  findUserCampaignParticipationOverviews,
  findUserForOidcReconciliation,
  findUserOrganizationsForAdmin,
  findUserPrivateCertificates,
  flagSessionResultsAsSentToPrescriber,
  generateUsername,
  generateUsernameWithTemporaryPassword,
  getAccountRecoveryDetails,
  getAdminMemberDetails,
  getAdminMembers,
  getAnswer,
  getAssessment,
  getAttendanceSheet,
  getAvailableTargetProfilesForOrganization,
  getCampaign,
  getCampaignAssessmentParticipation,
  getCampaignAssessmentParticipationResult,
  getCampaignByCode,
  getCampaignDetailsManagement,
  getCampaignParticipationsActivityByDay,
  getCampaignParticipationsCountByStage,
  getCampaignParticipationsCountsByStatus,
  getCampaignProfile,
  getCandidateImportSheetData,
  getCertificationAttestation,
  getCertificationCandidate,
  getCertificationCandidateSubscription,
  getCertificationCenter,
  getCertificationCenterForAdmin,
  getCertificationCenterInvitation,
  getCertificationCourse,
  getCertificationDetails,
  getCertificationPointOfContact,
  getCertificationsResultsForLS,
  getChallengeForPixAutoAnswer,
  getCleaCertifiedCandidateBySession,
  getCorrectionForAnswer,
  getCurrentUser,
  getExternalAuthenticationRedirectionUrl,
  getFrameworkAreas,
  getFrameworks,
  getIdentityProviders,
  getImportSessionComplementaryCertificationHabilitationsLabels,
  getJuryCertification,
  getJurySession,
  getLastChallengeIdFromAssessmentId,
  getLearningContentByTargetProfile,
  getLearningContentForTargetProfileSubmission,
  getNextChallengeForCampaignAssessment,
  getNextChallengeForCertification,
  getNextChallengeForCompetenceEvaluation,
  getNextChallengeForDemo,
  getNextChallengeForPreview,
  getOrganizationDetails,
  getOrganizationInvitation,
  getOrganizationLearner,
  getOrganizationLearnerActivity,
  getOrganizationLearnersCsvTemplate,
  getOrganizationMemberIdentities,
  getOrganizationPlacesCapacity,
  getPaginatedParticipantsForAnOrganization,
  getParticipantsDivision,
  getParticipantsGroup,
  getParticipationsCountByMasteryRate,
  getPoleEmploiSendings,
  getPrescriber,
  getPrivateCertificate,
  getProgression,
  getRecentlyUsedTags,
  getScoCertificationResultsByDivision,
  getScorecard,
  getSession,
  getSessionCertificationCandidates,
  getSessionCertificationReports,
  getSessionForSupervising,
  getSessionResults,
  getSessionResultsByResultRecipientEmail,
  getShareableCertificate,
  getSupervisorKitSessionInfo,
  getTargetProfileContentAsJson,
  getTargetProfileForAdmin,
  getTraining,
  getUserByResetPasswordDemand,
  getUserCampaignAssessmentResult,
  getUserCampaignParticipationToCampaign,
  getUserCertificationEligibility,
  getUserDetailsForAdmin,
  getUserProfile,
  getUserProfileSharedForCampaign,
  handleBadgeAcquisition,
  handleTrainingRecommendation,
  importCertificationCandidatesFromCandidatesImportSheet,
  importOrganizationLearnersFromSIECLEFormat,
  importSupOrganizationLearners,
  improveCompetenceEvaluation,
  linkUserToSessionCertificationCandidate,
  manuallyResolveCertificationIssueReport,
  markTargetProfileAsSimplifiedAccess,
  neutralizeChallenge,
  outdateTargetProfile,
  publishSession,
  publishSessionsInBatch,
  reassignAuthenticationMethodToAnotherUser,
  reconcileOidcUser,
  reconcileScoOrganizationLearnerAutomatically,
  reconcileScoOrganizationLearnerManually,
  reconcileSupOrganizationLearner,
  rememberUserHasSeenAssessmentInstructions,
  rememberUserHasSeenChallengeTooltip,
  rememberUserHasSeenLastDataProtectionPolicyInformation,
  rememberUserHasSeenNewDashboardInfo,
  removeAuthenticationMethod,
  replaceSupOrganizationLearners,
  resetScorecard,
  retrieveLastOrCreateCertificationCourse,
  revokeRefreshToken,
  saveAdminMember,
  saveCertificationIssueReport,
  saveComputedCampaignParticipationResult,
  saveJuryComplementaryCertificationCourseResult,
  sendEmailForAccountRecovery,
  sendScoInvitation,
  sendSharedParticipationResultsToPoleEmploi,
  sendVerificationCode,
  shareCampaignResult,
  simulateFlashScoring,
  simulateOldScoring,
  startCampaignParticipation,
  startOrResumeCompetenceEvaluation,
  startWritingCampaignAssessmentResultsToStream,
  startWritingCampaignProfilesCollectionResultsToStream,
  superviseSession,
  unarchiveCampaign,
  unblockUserAccount,
  uncancelCertificationCourse,
  unpublishSession,
  updateAdminMember,
  updateBadge,
  updateCampaign,
  updateCampaignDetailsManagement,
  updateCertificationCenter,
  updateCertificationCenterReferer,
  updateExpiredPassword,
  updateLastQuestionState,
  updateMembership,
  updateOrganizationInformation,
  updateOrganizationLearnerDependentUserPassword,
  updateParticipantExternalId,
  updateSession,
  updateStudentNumber,
  updateTargetProfile,
  updateTraining,
  updateUserDetailsForAdministration,
  updateUserEmailWithValidation,
  updateUserForAccountRecovery,
  updateUserPassword,
  validateSessions,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
