const settings = require('../../config.js');
const accountRecoveryDemandRepository = require('../../infrastructure/repositories/account-recovery-demand-repository.js');
const adminMemberRepository = require('../../infrastructure/repositories/admin-member-repository.js');
const algorithmDataFetcherService = require('../../domain/services/algorithm-methods/data-fetcher.js');
const answerRepository = require('../../infrastructure/repositories/answer-repository.js');
const areaRepository = require('../../infrastructure/repositories/area-repository.js');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository.js');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository.js');
const authenticationMethodRepository = require('../../infrastructure/repositories/authentication-method-repository.js');
const authenticationServiceRegistry = require('../services/authentication/authentication-service-registry.js');
const authenticationSessionService = require('../../domain/services/authentication/authentication-session-service.js');
const badgeAcquisitionRepository = require('../../infrastructure/repositories/badge-acquisition-repository.js');
const badgeCriteriaRepository = require('../../infrastructure/repositories/badge-criteria-repository.js');
const badgeForCalculationRepository = require('../../infrastructure/repositories/badge-for-calculation-repository.js');
const badgeRepository = require('../../infrastructure/repositories/badge-repository.js');
const campaignAdministrationRepository = require('../../infrastructure/repositories/campaigns-administration/campaign-repository.js');
const campaignAnalysisRepository = require('../../infrastructure/repositories/campaign-analysis-repository.js');
const campaignAssessmentParticipationRepository = require('../../infrastructure/repositories/campaign-assessment-participation-repository.js');
const campaignAssessmentParticipationResultListRepository = require('../../infrastructure/repositories/campaign-assessment-participation-result-list-repository.js');
const campaignAssessmentParticipationResultRepository = require('../../infrastructure/repositories/campaign-assessment-participation-result-repository.js');
const campaignCreatorRepository = require('../../infrastructure/repositories/campaign-creator-repository.js');
const campaignForArchivingRepository = require('../../infrastructure/repositories/campaign/campaign-for-archiving-repository.js');
const campaignParticipantActivityRepository = require('../../infrastructure/repositories/campaign-participant-activity-repository.js');
const campaignCollectiveResultRepository = require('../../infrastructure/repositories/campaign-collective-result-repository.js');
const campaignManagementRepository = require('../../infrastructure/repositories/campaign-management-repository.js');
const campaignParticipationInfoRepository = require('../../infrastructure/repositories/campaign-participation-info-repository.js');
const campaignParticipantRepository = require('../../infrastructure/repositories/campaign-participant-repository.js');
const campaignParticipationOverviewRepository = require('../../infrastructure/repositories/campaign-participation-overview-repository.js');
const campaignParticipationRepository = require('../../infrastructure/repositories/campaign-participation-repository.js');
const campaignParticipationResultRepository = require('../../infrastructure/repositories/campaign-participation-result-repository.js');
const campaignParticipationsStatsRepository = require('../../infrastructure/repositories/campaign-participations-stats-repository.js');
const campaignProfilesCollectionParticipationSummaryRepository = require('../../infrastructure/repositories/campaign-profiles-collection-participation-summary-repository.js');
const campaignProfileRepository = require('../../infrastructure/repositories/campaign-profile-repository.js');
const campaignReportRepository = require('../../infrastructure/repositories/campaign-report-repository.js');
const campaignRepository = require('../../infrastructure/repositories/campaign-repository.js');
const campaignToJoinRepository = require('../../infrastructure/repositories/campaign-to-join-repository.js');
const campaignCsvExportService = require('../../domain/services/campaign-csv-export-service.js');
const certificateRepository = require('../../infrastructure/repositories/certificate-repository.js');
const certificationAssessmentRepository = require('../../infrastructure/repositories/certification-assessment-repository.js');
const certificationAttestationPdf = require('../../infrastructure/utils/pdf/certification-attestation-pdf.js');
const certificationBadgesService = require('../../domain/services/certification-badges-service.js');
const certificationCandidateRepository = require('../../infrastructure/repositories/certification-candidate-repository.js');
const certificationCandidateForSupervisingRepository = require('../../infrastructure/repositories/certification-candidate-for-supervising-repository.js');
const certificationCandidatesOdsService = require('../../domain/services/certification-candidates-ods-service.js');
const certificationCenterInvitationRepository = require('../../infrastructure/repositories/certification-center-invitation-repository.js');
const certificationCenterInvitedUserRepository = require('../../infrastructure/repositories/certification-center-invited-user-repository.js');
const certificationCenterMembershipRepository = require('../../infrastructure/repositories/certification-center-membership-repository.js');
const certificationCenterForAdminRepository = require('../../infrastructure/repositories/certification-center-for-admin-repository.js');
const certificationCenterRepository = require('../../infrastructure/repositories/certification-center-repository.js');
const certificationChallengeRepository = require('../../infrastructure/repositories/certification-challenge-repository.js');
const certificationChallengesService = require('../../domain/services/certification-challenges-service.js');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository.js');
const certificationCpfCityRepository = require('../../infrastructure/repositories/certification-cpf-city-repository.js');
const certificationCpfCountryRepository = require('../../infrastructure/repositories/certification-cpf-country-repository.js');
const certificationIssueReportRepository = require('../../infrastructure/repositories/certification-issue-report-repository.js');
const certificationLsRepository = require('../../infrastructure/repositories/certification-livret-scolaire-repository.js');
const certificationOfficerRepository = require('../../infrastructure/repositories/certification-officer-repository.js');
const certificationPointOfContactRepository = require('../../infrastructure/repositories/certification-point-of-contact-repository.js');
const certificationReportRepository = require('../../infrastructure/repositories/certification-report-repository.js');
const certificationRepository = require('../../infrastructure/repositories/certification-repository.js');
const certificationCpfService = require('../../domain/services/certification-cpf-service.js');
const certificationResultRepository = require('../../infrastructure/repositories/certification-result-repository.js');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository.js');
const challengeForPixAutoAnswerRepository = require('../../infrastructure/repositories/challenge-for-pix-auto-answer-repository.js');
const cleaCertifiedCandidateRepository = require('../../infrastructure/repositories/clea-certified-candidate-repository.js');
const competenceEvaluationRepository = require('../../infrastructure/repositories/competence-evaluation-repository.js');
const competenceMarkRepository = require('../../infrastructure/repositories/competence-mark-repository.js');
const competenceRepository = require('../../infrastructure/repositories/competence-repository.js');
const competenceTreeRepository = require('../../infrastructure/repositories/competence-tree-repository.js');
const complementaryCertificationHabilitationRepository = require('../../infrastructure/repositories/complementary-certification-habilitation-repository.js');
const complementaryCertificationRepository = require('../../infrastructure/repositories/complementary-certification-repository.js');
const complementaryCertificationSubscriptionRepository = require('../../infrastructure/repositories/complementary-certification-subscription-repository.js');
const complementaryCertificationCourseResultRepository = require('../../infrastructure/repositories/complementary-certification-course-result-repository.js');
const correctionRepository = require('../../infrastructure/repositories/correction-repository.js');
const countryRepository = require('../../infrastructure/repositories/country-repository.js');
const courseRepository = require('../../infrastructure/repositories/course-repository.js');
const cpfCertificationResultRepository = require('../../infrastructure/repositories/cpf-certification-result-repository.js');
const dataProtectionOfficerRepository = require('../../infrastructure/repositories/data-protection-officer-repository.js');
const divisionRepository = require('../../infrastructure/repositories/division-repository.js');
const encryptionService = require('../../domain/services/encryption-service.js');
const flashAssessmentResultRepository = require('../../infrastructure/repositories/flash-assessment-result-repository.js');
const flashAlgorithmService = require('../../domain/services/algorithm-methods/flash.js');
const frameworkRepository = require('../../infrastructure/repositories/framework-repository.js');
const getCompetenceLevel = require('../../domain/services/get-competence-level.js');
const sessionForSupervisorKitRepository = require('../../infrastructure/repositories/sessions/session-for-supervisor-kit-repository.js');
const groupRepository = require('../../infrastructure/repositories/group-repository.js');
const finalizedSessionRepository = require('../../infrastructure/repositories/sessions/finalized-session-repository.js');
const supOrganizationLearnerRepository = require('../../infrastructure/repositories/sup-organization-learner-repository.js');
const improvementService = require('../../domain/services/improvement-service.js');
const issueReportCategoryRepository = require('../../infrastructure/repositories/issue-report-category-repository.js');
const juryCertificationRepository = require('../../infrastructure/repositories/jury-certification-repository.js');
const juryCertificationSummaryRepository = require('../../infrastructure/repositories/jury-certification-summary-repository.js');
const jurySessionRepository = require('../../infrastructure/repositories/sessions/jury-session-repository.js');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository.js');
const learningContentRepository = require('../../infrastructure/repositories/learning-content-repository.js');
const localeService = require('../../domain/services/locale-service.js');
const mailService = require('../../domain/services/mail-service.js');
const membershipRepository = require('../../infrastructure/repositories/membership-repository.js');
const obfuscationService = require('../../domain/services/obfuscation-service.js');
const organizationMemberIdentityRepository = require('../../infrastructure/repositories/organization-member-identity-repository.js');
const organizationForAdminRepository = require('../../infrastructure/repositories/organization-for-admin-repository.js');
const organizationRepository = require('../../infrastructure/repositories/organization-repository.js');
const organizationPlacesLotRepository = require('../../infrastructure/repositories/organizations/organization-places-lot-repository.js');
const organizationPlacesCapacityRepository = require('../../infrastructure/repositories/organization-places-capacity-repository.js');
const organizationInvitationRepository = require('../../infrastructure/repositories/organization-invitation-repository.js');
const organizationInvitedUserRepository = require('../../infrastructure/repositories/organization-invited-user-repository.js');
const organizationTagRepository = require('../../infrastructure/repositories/organization-tag-repository.js');
const organizationsToAttachToTargetProfileRepository = require('../../infrastructure/repositories/organizations-to-attach-to-target-profile-repository.js');
const organizationLearnerFollowUpRepository = require('../../infrastructure/repositories/organization-learner-follow-up/organization-learner-repository.js');
const organizationLearnerRepository = require('../../infrastructure/repositories/organization-learner-repository.js');
const organizationParticipantRepository = require('../../infrastructure/repositories/organization-participant-repository.js');
const organizationLearnerActivityRepository = require('../../infrastructure/repositories/organization-learner-activity-repository.js');
const organizationLearnersCsvService = require('../../domain/services/organization-learners-csv-service.js');
const organizationLearnersXmlService = require('../../domain/services/organization-learners-xml-service.js');
const participantResultRepository = require('../../infrastructure/repositories/participant-result-repository.js');
const participationsForCampaignManagementRepository = require('../../infrastructure/repositories/participations-for-campaign-management-repository.js');
const participationsForUserManagementRepository = require('../../infrastructure/repositories/participations-for-user-management-repository.js');
const userOrganizationsForAdminRepository = require('../../infrastructure/repositories/user-organizations-for-admin-repository.js');
const partnerCertificationScoringRepository = require('../../infrastructure/repositories/partner-certification-scoring-repository.js');
const passwordGenerator = require('../../domain/services/password-generator.js');
const pickChallengeService = require('../services/pick-challenge-service.js');
const pixAuthenticationService = require('../../domain/services/authentication/pix-authentication-service.js');
const placementProfileService = require('../../domain/services/placement-profile-service.js');
const poleEmploiSendingRepository = require('../../infrastructure/repositories/pole-emploi-sending-repository.js');
const prescriberRepository = require('../../infrastructure/repositories/prescriber-repository.js');
const resetPasswordService = require('../../domain/services/reset-password-service.js');
const resetPasswordDemandRepository = require('../../infrastructure/repositories/reset-password-demands-repository.js');
const scoAccountRecoveryService = require('../services/sco-account-recovery-service.js');
const scoCertificationCandidateRepository = require('../../infrastructure/repositories/sco-certification-candidate-repository.js');
const scoOrganizationParticipantRepository = require('../../infrastructure/repositories/sco-organization-participant-repository.js');
const scorecardService = require('../../domain/services/scorecard-service.js');
const scoringCertificationService = require('../../domain/services/scoring/scoring-certification-service.js');
const supOrganizationParticipantRepository = require('../../infrastructure/repositories/sup-organization-participant-repository.js');
const sessionForAttendanceSheetRepository = require('../../infrastructure/repositories/sessions/session-for-attendance-sheet-repository.js');
const sessionsImportValidationService = require('../../domain/services/sessions-mass-import/sessions-import-validation-service.js');
const sessionPublicationService = require('../../domain/services/session-publication-service.js');
const sessionRepository = require('../../infrastructure/repositories/sessions/session-repository.js');
const sessionForSupervisingRepository = require('../../infrastructure/repositories/sessions/session-for-supervising-repository.js');
const sessionJuryCommentRepository = require('../../infrastructure/repositories/sessions/session-jury-comment-repository.js');
const sessionSummaryRepository = require('../../infrastructure/repositories/sessions/session-summary-repository.js');
const skillRepository = require('../../infrastructure/repositories/skill-repository.js');
const skillSetRepository = require('../../infrastructure/repositories/skill-set-repository.js');
const studentRepository = require('../../infrastructure/repositories/student-repository.js');
const supervisorAccessRepository = require('../../infrastructure/repositories/supervisor-access-repository.js');
const tagRepository = require('../../infrastructure/repositories/tag-repository.js');
const TargetProfileForSpecifierRepository = require('../../infrastructure/repositories/campaign/target-profile-for-specifier-repository.js');
const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository.js');
const targetProfileSummaryForAdminRepository = require('../../infrastructure/repositories/target-profile-summary-for-admin-repository.js');
const targetProfileForUpdateRepository = require('../../infrastructure/repositories/target-profile-for-update-repository.js');
const targetProfileShareRepository = require('../../infrastructure/repositories/target-profile-share-repository.js');
const targetProfileForAdminRepository = require('../../infrastructure/repositories/target-profile-for-admin-repository.js');
const targetProfileTrainingRepository = require('../../infrastructure/repositories/target-profile-training-repository.js');
const thematicRepository = require('../../infrastructure/repositories/thematic-repository.js');
const tokenService = require('../../domain/services/token-service.js');
const refreshTokenService = require('../../domain/services/refresh-token-service.js');
const trainingRepository = require('../../infrastructure/repositories/training-repository.js');
const trainingTriggerRepository = require('../../infrastructure/repositories/training-trigger-repository.js');
const tubeRepository = require('../../infrastructure/repositories/tube-repository.js');
const tutorialEvaluationRepository = require('../../infrastructure/repositories/tutorial-evaluation-repository.js');
const tutorialRepository = require('../../infrastructure/repositories/tutorial-repository.js');
const userEmailRepository = require('../../infrastructure/repositories/user-email-repository.js');
const userLoginRepository = require('../../infrastructure/repositories/user-login-repository.js');
const userOrgaSettingsRepository = require('../../infrastructure/repositories/user-orga-settings-repository.js');
const userRecommendedTrainingRepository = require('../../infrastructure/repositories/user-recommended-training-repository.js');
const userReconciliationService = require('../services/user-reconciliation-service.js');
const userToCreateRepository = require('../../infrastructure/repositories/user-to-create-repository.js');
const userRepository = require('../../infrastructure/repositories/user-repository.js');
const userService = require('../../domain/services/user-service.js');
const userSavedTutorialRepository = require('../../infrastructure/repositories/user-saved-tutorial-repository.js');
const verifyCertificateCodeService = require('../../domain/services/verify-certificate-code-service.js');
const participantResultsSharedRepository = require('../../infrastructure/repositories/participant-results-shared-repository.js');
const poleEmploiNotifier = require('../../infrastructure/externals/pole-emploi/pole-emploi-notifier.js');
const disabledPoleEmploiNotifier = require('../../infrastructure/externals/pole-emploi/disabled-pole-emploi-notifier.js');

function requirePoleEmploiNotifier() {
  if (settings.poleEmploi.pushEnabled) {
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
  sessionRepository,
  sessionForSupervisingRepository,
  sessionJuryCommentRepository,
  sessionSummaryRepository,
  settings,
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
};

const { injectDependencies } = require('../../infrastructure/utils/dependency-injection.js');

const abortCertificationCourse = require('./abort-certification-course.js');
const acceptCertificationCenterInvitation = require('./accept-certification-center-invitation.js');
const acceptOrganizationInvitation = require('./accept-organization-invitation.js');
const acceptPixCertifTermsOfService = require('./accept-pix-certif-terms-of-service.js');
const acceptPixLastTermsOfService = require('./accept-pix-last-terms-of-service.js');
const acceptPixOrgaTermsOfService = require('./accept-pix-orga-terms-of-service.js');
const addCertificationCandidateToSession = require('./add-certification-candidate-to-session.js');
const addPixAuthenticationMethodByEmail = require('./add-pix-authentication-method-by-email.js');
const addTutorialEvaluation = require('./add-tutorial-evaluation.js');
const addTutorialToUser = require('./add-tutorial-to-user.js');
const anonymizeUser = require('./anonymize-user.js');
const archiveCampaign = require('./archive-campaign.js');
const archiveOrganization = require('./archive-organization.js');
const assignCertificationOfficerToJurySession = require('./assign-certification-officer-to-jury-session.js');
const attachOrganizationsFromExistingTargetProfile = require('./attach-organizations-from-existing-target-profile.js');
const attachOrganizationsToTargetProfile = require('./attach-organizations-to-target-profile.js');
const attachTargetProfilesToOrganization = require('./attach-target-profiles-to-organization.js');
const attachTargetProfilesToTraining = require('./attach-target-profiles-to-training.js');
const authenticateAnonymousUser = require('./authenticate-anonymous-user.js');
const authenticateApplication = require('./authenticate-application.js');
const authenticateExternalUser = require('./authenticate-external-user.js');
const authenticateOidcUser = require('./authentication/authenticate-oidc-user.js');
const authenticateUser = require('./authenticate-user.js');
const authorizeCertificationCandidateToResume = require('./authorize-certification-candidate-to-resume.js');
const authorizeCertificationCandidateToStart = require('./authorize-certification-candidate-to-start.js');
const beginCampaignParticipationImprovement = require('./begin-campaign-participation-improvement.js');
const campaignAdministrationArchiveCampaign = require('./campaigns-administration/archive-campaigns.js');
const cancelCertificationCenterInvitation = require('./cancel-certification-center-invitation.js');
const cancelCertificationCourse = require('./cancel-certification-course.js');
const cancelOrganizationInvitation = require('./cancel-organization-invitation.js');
const changeUserLang = require('./change-user-lang.js');
const checkScoAccountRecovery = require('./check-sco-account-recovery.js');
const commentSessionAsJury = require('./comment-session-as-jury.js');
const completeAssessment = require('./complete-assessment.js');
const computeCampaignAnalysis = require('./compute-campaign-analysis.js');
const computeCampaignCollectiveResult = require('./compute-campaign-collective-result.js');
const computeCampaignParticipationAnalysis = require('./compute-campaign-participation-analysis.js');
const correctAnswerThenUpdateAssessment = require('./correct-answer-then-update-assessment.js');
const correctAnswer = require('./correct-answer.js');
const correctCandidateIdentityInCertificationCourse = require('./correct-candidate-identity-in-certification-course.js');
const createAccessTokenFromRefreshToken = require('./create-access-token-from-refresh-token.js');
const createAndReconcileUserToOrganizationLearner = require('./create-and-reconcile-user-to-organization-learner.js');
const createBadge = require('./create-badge.js');
const createCampaign = require('./create-campaign.js');
const createCertificationCenter = require('./create-certification-center.js');
const createCertificationCenterMembershipByEmail = require('./create-certification-center-membership-by-email.js');
const createCertificationCenterMembershipForScoOrganizationMember = require('./create-certification-center-membership-for-sco-organization-member.js');
const createLcmsRelease = require('./create-lcms-release.js');
const createMembership = require('./create-membership.js');
const createOidcUser = require('./create-oidc-user.js');
const createOrUpdateCertificationCenterInvitationForAdmin = require('./create-or-update-certification-center-invitation-for-admin.js');
const createOrUpdateTrainingTrigger = require('./create-or-update-training-trigger.js');
const createOrUpdateUserOrgaSettings = require('./create-or-update-user-orga-settings.js');
const createOrganization = require('./create-organization.js');
const createOrganizationInvitationByAdmin = require('./create-organization-invitation-by-admin.js');
const createOrganizationInvitations = require('./create-organization-invitations.js');
const resendOrganizationInvitation = require('./resend-organization-invitation.js');
const createOrganizationPlacesLot = require('./create-organization-places-lot.js');
const createOrganizationsWithTagsAndTargetProfiles = require('./create-organizations-with-tags-and-target-profiles.js');
const createPasswordResetDemand = require('./create-password-reset-demand.js');
const createSession = require('./create-session.js');
const createSessions = require('./sessions-mass-import/create-sessions.js');
const createStage = require('./target-profile-management/create-stage.js');
const createTag = require('./create-tag.js');
const createTargetProfile = require('./create-target-profile.js');
const createTraining = require('./create-training.js');
const createUser = require('./create-user.js');
const createUserAndReconcileToOrganizationLearnerFromExternalUser = require('./create-user-and-reconcile-to-organization-learner-from-external-user.js');
const deactivateAdminMember = require('./deactivate-admin-member.js');
const deleteCampaignParticipation = require('./delete-campaign-participation.js');
const deleteCampaignParticipationForAdmin = require('./delete-campaign-participation-for-admin.js');
const deleteCertificationIssueReport = require('./delete-certification-issue-report.js');
const deleteOrganizationPlaceLot = require('./delete-organization-place-lot.js');
const deleteSession = require('./delete-session.js');
const deleteSessionJuryComment = require('./delete-session-jury-comment.js');
const deleteStage = require('./target-profile-management/delete-stage.js');
const deleteUnassociatedBadge = require('./delete-unassociated-badge.js');
const deleteUnlinkedCertificationCandidate = require('./delete-unlinked-certification-candidate.js');
const deneutralizeChallenge = require('./deneutralize-challenge.js');
const disableCertificationCenterMembership = require('./disable-certification-center-membership.js');
const disableMembership = require('./disable-membership.js');
const dissociateUserFromOrganizationLearner = require('./dissociate-user-from-organization-learner.js');
const endAssessmentBySupervisor = require('./end-assessment-by-supervisor.js');
const enrollStudentsToSession = require('./enroll-students-to-session.js');
const finalizeSession = require('./finalize-session.js');
const findAllTags = require('./find-all-tags.js');
const findAnswerByAssessment = require('./find-answer-by-assessment.js');
const findAnswerByChallengeAndAssessment = require('./find-answer-by-challenge-and-assessment.js');
const findAssessmentParticipationResultList = require('./find-assessment-participation-result-list.js');
const findAssociationBetweenUserAndOrganizationLearner = require('./find-association-between-user-and-organization-learner.js');
const findCampaignParticipationTrainings = require('./find-campaign-participation-trainings.js');
const findCampaignParticipationsForUserManagement = require('./find-campaign-participations-for-user-management.js');
const findCampaignProfilesCollectionParticipationSummaries = require('./find-campaign-profiles-collection-participation-summaries.js');
const findCertificationAttestationsForDivision = require('./certificate/find-certification-attestations-for-division.js');
const findCertificationCenterMembershipsByCertificationCenter = require('./find-certification-center-memberships-by-certification-center.js');
const findCertificationCenterMembershipsByUser = require('./find-certification-center-memberships-by-user.js');
const findCompetenceEvaluationsByAssessment = require('./find-competence-evaluations-by-assessment.js');
const findComplementaryCertifications = require('./find-complementary-certifications.js');
const findCountries = require('./find-countries.js');
const findDivisionsByCertificationCenter = require('./find-divisions-by-certification-center.js');
const findDivisionsByOrganization = require('./find-divisions-by-organization.js');
const findFinalizedSessionsToPublish = require('./find-finalized-sessions-to-publish.js');
const findFinalizedSessionsWithRequiredAction = require('./find-finalized-sessions-with-required-action.js');
const findGroupsByOrganization = require('./find-groups-by-organization.js');
const findLatestOngoingUserCampaignParticipations = require('./find-latest-ongoing-user-campaign-participations.js');
const findOrganizationPlacesLot = require('./find-organization-places-lot.js');
const findOrganizationTargetProfileSummariesForAdmin = require('./find-organization-target-profile-summaries-for-admin.js');
const findPaginatedCampaignManagements = require('./find-paginated-campaign-managements.js');
const findPaginatedCampaignParticipantsActivities = require('./find-paginated-campaign-participants-activities.js');
const findPaginatedCertificationCenterSessionSummaries = require('./find-paginated-certification-center-session-summaries.js');
const findPaginatedFilteredCertificationCenters = require('./find-paginated-filtered-certification-centers.js');
const findPaginatedFilteredOrganizationCampaigns = require('./find-paginated-filtered-organization-campaigns.js');
const findPaginatedFilteredOrganizationMemberships = require('./find-paginated-filtered-organization-memberships.js');
const findPaginatedFilteredOrganizations = require('./find-paginated-filtered-organizations.js');
const findPaginatedFilteredScoParticipants = require('./find-paginated-filtered-sco-participants.js');
const findPaginatedFilteredSupParticipants = require('./find-paginated-filtered-sup-participants.js');
const findPaginatedFilteredTargetProfileOrganizations = require('./find-paginated-filtered-target-profile-organizations.js');
const findPaginatedFilteredTargetProfileSummariesForAdmin = require('./find-paginated-filtered-target-profile-summaries-for-admin.js');
const findPaginatedFilteredTutorials = require('./find-paginated-filtered-tutorials.js');
const findPaginatedFilteredUsers = require('./find-paginated-filtered-users.js');
const findPaginatedParticipationsForCampaignManagement = require('./find-paginated-participations-for-campaign-management.js');
const findPaginatedTargetProfileTrainingSummaries = require('./find-paginated-target-profile-training-summaries.js');
const findPaginatedTrainingSummaries = require('./find-paginated-training-summaries.js');
const findPaginatedUserRecommendedTrainings = require('./find-paginated-user-recommended-trainings.js');
const findPendingCertificationCenterInvitations = require('./find-pending-certification-center-invitations.js');
const findPendingOrganizationInvitations = require('./find-pending-organization-invitations.js');
const findStudentsForEnrollment = require('./find-students-for-enrollment.js');
const findTargetProfileStages = require('./find-target-profile-stages.js');
const findTargetProfileSummariesForTraining = require('./find-target-profile-summaries-for-training.js');
const findTutorials = require('./find-tutorials.js');
const findUserAuthenticationMethods = require('./find-user-authentication-methods.js');
const findUserCampaignParticipationOverviews = require('./find-user-campaign-participation-overviews.js');
const findUserForOidcReconciliation = require('./find-user-for-oidc-reconciliation.js');
const findUserOrganizationsForAdmin = require('./find-user-organizations-for-admin.js');
const findUserPrivateCertificates = require('./find-user-private-certificates.js');
const flagSessionResultsAsSentToPrescriber = require('./flag-session-results-as-sent-to-prescriber.js');
const generateUsername = require('./generate-username.js');
const generateUsernameWithTemporaryPassword = require('./generate-username-with-temporary-password.js');
const getAccountRecoveryDetails = require('./account-recovery/get-account-recovery-details.js');
const getAdminMemberDetails = require('./get-admin-member-details.js');
const getAdminMembers = require('./get-admin-members.js');
const getAnswer = require('./get-answer.js');
const getAssessment = require('./get-assessment.js');
const getAttendanceSheet = require('./get-attendance-sheet.js');
const getAvailableTargetProfilesForOrganization = require('./get-available-target-profiles-for-organization.js');
const getCampaign = require('./get-campaign.js');
const getCampaignAssessmentParticipation = require('./get-campaign-assessment-participation.js');
const getCampaignAssessmentParticipationResult = require('./get-campaign-assessment-participation-result.js');
const getCampaignByCode = require('./get-campaign-by-code.js');
const getCampaignDetailsManagement = require('./get-campaign-details-management.js');
const getCampaignParticipationsActivityByDay = require('./get-campaign-participations-activity-by-day.js');
const getCampaignParticipationsCountByStage = require('./get-campaign-participations-counts-by-stage.js');
const getCampaignParticipationsCountsByStatus = require('./get-campaign-participations-counts-by-status.js');
const getCampaignProfile = require('./get-campaign-profile.js');
const getCandidateImportSheetData = require('./get-candidate-import-sheet-data.js');
const getCertificationAttestation = require('./certificate/get-certification-attestation.js');
const getCertificationCandidate = require('./get-certification-candidate.js');
const getCertificationCandidateSubscription = require('./get-certification-candidate-subscription.js');
const getCertificationCenter = require('./get-certification-center.js');
const getCertificationCenterForAdmin = require('./get-certification-center-for-admin.js');
const getCertificationCenterInvitation = require('./get-certification-center-invitation.js');
const getCertificationCourse = require('./get-certification-course.js');
const getCertificationDetails = require('./get-certification-details.js');
const getCertificationPointOfContact = require('./get-certification-point-of-contact.js');
const getCertificationsResultsForLS = require('./certificate/get-certifications-results-for-ls.js');
const getChallengeForPixAutoAnswer = require('./get-challenge-for-pix-auto-answer.js');
const getCleaCertifiedCandidateBySession = require('./get-clea-certified-candidate-by-session.js');
const getCorrectionForAnswer = require('./get-correction-for-answer.js');
const getCurrentUser = require('./get-current-user.js');
const getExternalAuthenticationRedirectionUrl = require('./get-external-authentication-redirection-url.js');
const getFrameworkAreas = require('./get-framework-areas.js');
const getFrameworks = require('./get-frameworks.js');
const getIdentityProviders = require('./get-identity-providers.js');
const getImportSessionComplementaryCertificationHabilitationsLabels = require('./get-import-session-complementary-certification-habilitations-labels.js');
const getJuryCertification = require('./get-jury-certification.js');
const getJurySession = require('./get-jury-session.js');
const getLastChallengeIdFromAssessmentId = require('./get-last-challenge-id-from-assessment-id.js');
const getLearningContentByTargetProfile = require('./get-learning-content-by-target-profile.js');
const getLearningContentForTargetProfileSubmission = require('./get-learning-content-for-target-profile-submission.js');
const getNextChallengeForCampaignAssessment = require('./get-next-challenge-for-campaign-assessment.js');
const getNextChallengeForCertification = require('./get-next-challenge-for-certification.js');
const getNextChallengeForCompetenceEvaluation = require('./get-next-challenge-for-competence-evaluation.js');
const getNextChallengeForDemo = require('./get-next-challenge-for-demo.js');
const getNextChallengeForPreview = require('./get-next-challenge-for-preview.js');
const getOrganizationDetails = require('./get-organization-details.js');
const getOrganizationInvitation = require('./get-organization-invitation.js');
const getOrganizationLearner = require('./get-organization-learner.js');
const getOrganizationLearnerActivity = require('./get-organization-learner-activity.js');
const getOrganizationLearnersCsvTemplate = require('./get-organization-learners-csv-template.js');
const getOrganizationMemberIdentities = require('./get-organization-members-identity.js');
const getOrganizationPlacesCapacity = require('./get-organization-places-capacity.js');
const getPaginatedParticipantsForAnOrganization = require('./get-paginated-participants-for-an-organization.js');
const getParticipantsDivision = require('./get-participants-division.js');
const getParticipantsGroup = require('./get-participants-group.js');
const getParticipationsCountByMasteryRate = require('./get-participations-count-by-mastery-rate.js');
const getPoleEmploiSendings = require('./get-pole-emploi-sendings.js');
const getPrescriber = require('./get-prescriber.js');
const getPrivateCertificate = require('./certificate/get-private-certificate.js');
const getProgression = require('./get-progression.js');
const getRecentlyUsedTags = require('./get-recently-used-tags.js');
const getScoCertificationResultsByDivision = require('./get-sco-certification-results-by-division.js');
const getScorecard = require('./get-scorecard.js');
const getSession = require('./get-session.js');
const getSessionCertificationCandidates = require('./get-session-certification-candidates.js');
const getSessionCertificationReports = require('./get-session-certification-reports.js');
const getSessionForSupervising = require('./get-session-for-supervising.js');
const getSessionResults = require('./get-session-results.js');
const getSessionResultsByResultRecipientEmail = require('./get-session-results-by-result-recipient-email.js');
const getShareableCertificate = require('./certificate/get-shareable-certificate.js');
const getSupervisorKitSessionInfo = require('./get-supervisor-kit-session-info.js');
const getTargetProfileContentAsJson = require('./get-target-profile-content-as-json.js');
const getTargetProfileForAdmin = require('./get-target-profile-for-admin.js');
const getTraining = require('./get-training.js');
const getUserByResetPasswordDemand = require('./get-user-by-reset-password-demand.js');
const getUserCampaignAssessmentResult = require('./get-user-campaign-assessment-result.js');
const getUserCampaignParticipationToCampaign = require('./get-user-campaign-participation-to-campaign.js');
const getUserCertificationEligibility = require('./get-user-certification-eligibility.js');
const getUserDetailsForAdmin = require('./get-user-details-for-admin.js');
const getUserProfile = require('./get-user-profile.js');
const getUserProfileSharedForCampaign = require('./get-user-profile-shared-for-campaign.js');
const handleBadgeAcquisition = require('./handle-badge-acquisition.js');
const handleTrainingRecommendation = require('./handle-training-recommendation.js');
const importCertificationCandidatesFromCandidatesImportSheet = require('./import-certification-candidates-from-candidates-import-sheet.js');
const importOrganizationLearnersFromSIECLEFormat = require('./import-organization-learners-from-siecle.js');
const importSupOrganizationLearners = require('./import-sup-organization-learners.js');
const improveCompetenceEvaluation = require('./improve-competence-evaluation.js');
const linkUserToSessionCertificationCandidate = require('./link-user-to-session-certification-candidate.js');
const manuallyResolveCertificationIssueReport = require('./manually-resolve-certification-issue-report.js');
const markTargetProfileAsSimplifiedAccess = require('./mark-target-profile-as-simplified-access.js');
const neutralizeChallenge = require('./neutralize-challenge.js');
const outdateTargetProfile = require('./outdate-target-profile.js');
const publishSession = require('./publish-session.js');
const publishSessionsInBatch = require('./publish-sessions-in-batch.js');
const reassignAuthenticationMethodToAnotherUser = require('./reassign-authentication-method-to-another-user.js');
const reconcileOidcUser = require('./reconcile-oidc-user.js');
const reconcileScoOrganizationLearnerAutomatically = require('./reconcile-sco-organization-learner-automatically.js');
const reconcileScoOrganizationLearnerManually = require('./reconcile-sco-organization-learner-manually.js');
const reconcileSupOrganizationLearner = require('./reconcile-sup-organization-learner.js');
const rememberUserHasSeenAssessmentInstructions = require('./remember-user-has-seen-assessment-instructions.js');
const rememberUserHasSeenChallengeTooltip = require('./remember-user-has-seen-challenge-tooltip.js');
const rememberUserHasSeenLastDataProtectionPolicyInformation = require('./remember-user-has-seen-last-data-protection-policy-information.js');
const rememberUserHasSeenNewDashboardInfo = require('./remember-user-has-seen-new-dashboard-info.js');
const removeAuthenticationMethod = require('./remove-authentication-method.js');
const replaceSupOrganizationLearners = require('./replace-sup-organization-learner.js');
const resetScorecard = require('./reset-scorecard.js');
const retrieveLastOrCreateCertificationCourse = require('./retrieve-last-or-create-certification-course.js');
const revokeRefreshToken = require('./revoke-refresh-token.js');
const saveAdminMember = require('./save-admin-member.js');
const saveCertificationIssueReport = require('./save-certification-issue-report.js');
const saveComputedCampaignParticipationResult = require('./save-computed-campaign-participation-result.js');
const saveJuryComplementaryCertificationCourseResult = require('./save-jury-complementary-certification-course-result.js');
const sendEmailForAccountRecovery = require('./account-recovery/send-email-for-account-recovery.js');
const sendScoInvitation = require('./send-sco-invitation.js');
const sendSharedParticipationResultsToPoleEmploi = require('./send-shared-participation-results-to-pole-emploi.js');
const sendVerificationCode = require('./send-verification-code.js');
const shareCampaignResult = require('./share-campaign-result.js');
const simulateFlashScoring = require('./simulate-flash-scoring.js');
const simulateOldScoring = require('./simulate-old-scoring.js');
const startCampaignParticipation = require('./start-campaign-participation.js');
const startOrResumeCompetenceEvaluation = require('./start-or-resume-competence-evaluation.js');
const startWritingCampaignAssessmentResultsToStream = require('./start-writing-campaign-assessment-results-to-stream.js');
const startWritingCampaignProfilesCollectionResultsToStream = require('./start-writing-campaign-profiles-collection-results-to-stream.js');
const superviseSession = require('./supervise-session.js');
const unarchiveCampaign = require('./unarchive-campaign.js');
const unblockUserAccount = require('./unblock-user-account.js');
const uncancelCertificationCourse = require('./uncancel-certification-course.js');
const unpublishSession = require('./unpublish-session.js');
const updateAdminMember = require('./update-admin-member.js');
const updateBadge = require('./update-badge.js');
const updateCampaign = require('./update-campaign.js');
const updateCampaignDetailsManagement = require('./update-campaign-details-management.js');
const updateCertificationCenter = require('./update-certification-center.js');
const updateCertificationCenterReferer = require('./update-certification-center-referer.js');
const updateExpiredPassword = require('./update-expired-password.js');
const updateLastQuestionState = require('./update-last-question-state.js');
const updateMembership = require('./update-membership.js');
const updateOrganizationInformation = require('./update-organization-information.js');
const updateOrganizationLearnerDependentUserPassword = require('./update-organization-learner-dependent-user-password.js');
const updateParticipantExternalId = require('./update-participant-external-id.js');
const updateSession = require('./update-session.js');
const updateStage = require('./target-profile-management/update-stage.js');
const updateStudentNumber = require('./update-student-number.js');
const updateTargetProfile = require('./update-target-profile.js');
const updateTraining = require('./update-training.js');
const updateUserDetailsForAdministration = require('./update-user-details-for-administration.js');
const updateUserEmailWithValidation = require('./update-user-email-with-validation.js');
const updateUserForAccountRecovery = require('./account-recovery/update-user-for-account-recovery.js');
const updateUserPassword = require('./update-user-password.js');
const validateSessions = require('./sessions-mass-import/validate-sessions.js');

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
  campaignAdministrationArchiveCampaign,
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
  createStage,
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
  enrollStudentsToSession,
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
  findGroupsByOrganization,
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
  findStudentsForEnrollment,
  findTargetProfileStages,
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
  updateStage,
  deleteStage,
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

module.exports = usecases;
