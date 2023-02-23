const accountRecoveryDemandRepository = require('../../infrastructure/repositories/account-recovery-demand-repository');
const adminMemberRepository = require('../../infrastructure/repositories/admin-member-repository');
const algorithmDataFetcherService = require('../../domain/services/algorithm-methods/data-fetcher');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const areaRepository = require('../../infrastructure/repositories/area-repository');
const assessmentRepository = require('../../infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../infrastructure/repositories/assessment-result-repository');
const authenticationMethodRepository = require('../../infrastructure/repositories/authentication-method-repository');
const authenticationServiceRegistry = require('../services/authentication/authentication-service-registry');
const authenticationSessionService = require('../../domain/services/authentication/authentication-session-service');
const badgeAcquisitionRepository = require('../../infrastructure/repositories/badge-acquisition-repository');
const badgeCriteriaRepository = require('../../infrastructure/repositories/badge-criteria-repository');
const badgeForCalculationRepository = require('../../infrastructure/repositories/badge-for-calculation-repository');
const badgeRepository = require('../../infrastructure/repositories/badge-repository');
const campaignAdministrationRepository = require('../../infrastructure/repositories/campaigns-administration/campaign-repository');
const campaignAnalysisRepository = require('../../infrastructure/repositories/campaign-analysis-repository');
const campaignAssessmentParticipationRepository = require('../../infrastructure/repositories/campaign-assessment-participation-repository');
const campaignAssessmentParticipationResultListRepository = require('../../infrastructure/repositories/campaign-assessment-participation-result-list-repository');
const campaignAssessmentParticipationResultRepository = require('../../infrastructure/repositories/campaign-assessment-participation-result-repository');
const campaignCreatorRepository = require('../../infrastructure/repositories/campaign-creator-repository');
const campaignForArchivingRepository = require('../../infrastructure/repositories/campaign/campaign-for-archiving-repository');
const campaignParticipantActivityRepository = require('../../infrastructure/repositories/campaign-participant-activity-repository');
const campaignCollectiveResultRepository = require('../../infrastructure/repositories/campaign-collective-result-repository');
const campaignManagementRepository = require('../../infrastructure/repositories/campaign-management-repository');
const campaignParticipationInfoRepository = require('../../infrastructure/repositories/campaign-participation-info-repository');
const campaignParticipantRepository = require('../../infrastructure/repositories/campaign-participant-repository');
const campaignParticipationOverviewRepository = require('../../infrastructure/repositories/campaign-participation-overview-repository');
const campaignParticipationRepository = require('../../infrastructure/repositories/campaign-participation-repository');
const campaignParticipationResultRepository = require('../../infrastructure/repositories/campaign-participation-result-repository');
const campaignParticipationsStatsRepository = require('../../infrastructure/repositories/campaign-participations-stats-repository');
const campaignProfilesCollectionParticipationSummaryRepository = require('../../infrastructure/repositories/campaign-profiles-collection-participation-summary-repository');
const campaignProfileRepository = require('../../infrastructure/repositories/campaign-profile-repository');
const campaignReportRepository = require('../../infrastructure/repositories/campaign-report-repository');
const campaignRepository = require('../../infrastructure/repositories/campaign-repository');
const campaignToJoinRepository = require('../../infrastructure/repositories/campaign-to-join-repository');
const campaignCsvExportService = require('../../domain/services/campaign-csv-export-service');
const certificateRepository = require('../../infrastructure/repositories/certificate-repository');
const certificationAssessmentRepository = require('../../infrastructure/repositories/certification-assessment-repository');
const certificationAttestationPdf = require('../../infrastructure/utils/pdf/certification-attestation-pdf');
const certificationBadgesService = require('../../domain/services/certification-badges-service');
const certificationCandidateRepository = require('../../infrastructure/repositories/certification-candidate-repository');
const certificationCandidateForSupervisingRepository = require('../../infrastructure/repositories/certification-candidate-for-supervising-repository');
const certificationCandidatesOdsService = require('../../domain/services/certification-candidates-ods-service');
const certificationCenterInvitationRepository = require('../../infrastructure/repositories/certification-center-invitation-repository');
const certificationCenterInvitedUserRepository = require('../../infrastructure/repositories/certification-center-invited-user-repository');
const certificationCenterMembershipRepository = require('../../infrastructure/repositories/certification-center-membership-repository');
const certificationCenterForAdminRepository = require('../../infrastructure/repositories/certification-center-for-admin-repository');
const certificationCenterRepository = require('../../infrastructure/repositories/certification-center-repository');
const certificationChallengeRepository = require('../../infrastructure/repositories/certification-challenge-repository');
const certificationChallengesService = require('../../domain/services/certification-challenges-service');
const certificationCourseRepository = require('../../infrastructure/repositories/certification-course-repository');
const certificationCpfCityRepository = require('../../infrastructure/repositories/certification-cpf-city-repository');
const certificationCpfCountryRepository = require('../../infrastructure/repositories/certification-cpf-country-repository');
const certificationIssueReportRepository = require('../../infrastructure/repositories/certification-issue-report-repository');
const certificationLsRepository = require('../../infrastructure/repositories/certification-livret-scolaire-repository');
const certificationOfficerRepository = require('../../infrastructure/repositories/certification-officer-repository');
const certificationPointOfContactRepository = require('../../infrastructure/repositories/certification-point-of-contact-repository');
const certificationReportRepository = require('../../infrastructure/repositories/certification-report-repository');
const certificationRepository = require('../../infrastructure/repositories/certification-repository');
const certificationCpfService = require('../../domain/services/certification-cpf-service');
const certificationResultRepository = require('../../infrastructure/repositories/certification-result-repository');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const challengeForPixAutoAnswerRepository = require('../../infrastructure/repositories/challenge-for-pix-auto-answer-repository');
const cleaCertifiedCandidateRepository = require('../../infrastructure/repositories/clea-certified-candidate-repository');
const competenceEvaluationRepository = require('../../infrastructure/repositories/competence-evaluation-repository');
const competenceMarkRepository = require('../../infrastructure/repositories/competence-mark-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const competenceTreeRepository = require('../../infrastructure/repositories/competence-tree-repository');
const complementaryCertificationHabilitationRepository = require('../../infrastructure/repositories/complementary-certification-habilitation-repository');
const complementaryCertificationRepository = require('../../infrastructure/repositories/complementary-certification-repository');
const complementaryCertificationSubscriptionRepository = require('../../infrastructure/repositories/complementary-certification-subscription-repository');
const complementaryCertificationCourseResultRepository = require('../../infrastructure/repositories/complementary-certification-course-result-repository');
const correctionRepository = require('../../infrastructure/repositories/correction-repository');
const countryRepository = require('../../infrastructure/repositories/country-repository');
const courseRepository = require('../../infrastructure/repositories/course-repository');
const cpfCertificationResultRepository = require('../../infrastructure/repositories/cpf-certification-result-repository');
const dataProtectionOfficerRepository = require('../../infrastructure/repositories/data-protection-officer-repository');
const divisionRepository = require('../../infrastructure/repositories/division-repository');
const encryptionService = require('../../domain/services/encryption-service');
const flashAssessmentResultRepository = require('../../infrastructure/repositories/flash-assessment-result-repository');
const flashAlgorithmService = require('../../domain/services/algorithm-methods/flash');
const frameworkRepository = require('../../infrastructure/repositories/framework-repository');
const getCompetenceLevel = require('../../domain/services/get-competence-level');
const sessionForSupervisorKitRepository = require('../../infrastructure/repositories/sessions/session-for-supervisor-kit-repository');
const groupRepository = require('../../infrastructure/repositories/group-repository');
const finalizedSessionRepository = require('../../infrastructure/repositories/sessions/finalized-session-repository');
const supOrganizationLearnerRepository = require('../../infrastructure/repositories/sup-organization-learner-repository');
const improvementService = require('../../domain/services/improvement-service');
const issueReportCategoryRepository = require('../../infrastructure/repositories/issue-report-category-repository');
const juryCertificationRepository = require('../../infrastructure/repositories/jury-certification-repository');
const juryCertificationSummaryRepository = require('../../infrastructure/repositories/jury-certification-summary-repository');
const jurySessionRepository = require('../../infrastructure/repositories/sessions/jury-session-repository');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository');
const learningContentRepository = require('../../infrastructure/repositories/learning-content-repository');
const mailService = require('../../domain/services/mail-service');
const membershipRepository = require('../../infrastructure/repositories/membership-repository');
const obfuscationService = require('../../domain/services/obfuscation-service');
const organizationMemberIdentityRepository = require('../../infrastructure/repositories/organization-member-identity-repository');
const organizationForAdminRepository = require('../../infrastructure/repositories/organization-for-admin-repository');
const organizationRepository = require('../../infrastructure/repositories/organization-repository');
const organizationPlacesLotRepository = require('../../infrastructure/repositories/organizations/organization-places-lot-repository');
const organizationPlacesCapacityRepository = require('../../infrastructure/repositories/organization-places-capacity-repository');
const organizationInvitationRepository = require('../../infrastructure/repositories/organization-invitation-repository');
const organizationInvitedUserRepository = require('../../infrastructure/repositories/organization-invited-user-repository');
const organizationTagRepository = require('../../infrastructure/repositories/organization-tag-repository');
const organizationsToAttachToTargetProfileRepository = require('../../infrastructure/repositories/organizations-to-attach-to-target-profile-repository');
const organizationLearnerFollowUpRepository = require('../../infrastructure/repositories/organization-learner-follow-up/organization-learner-repository');
const organizationLearnerRepository = require('../../infrastructure/repositories/organization-learner-repository');
const organizationParticipantRepository = require('../../infrastructure/repositories/organization-participant-repository');
const organizationLearnerActivityRepository = require('../../infrastructure/repositories/organization-learner-activity-repository');
const organizationLearnersCsvService = require('../../domain/services/organization-learners-csv-service');
const organizationLearnersXmlService = require('../../domain/services/organization-learners-xml-service');
const participantResultRepository = require('../../infrastructure/repositories/participant-result-repository');
const participationsForCampaignManagementRepository = require('../../infrastructure/repositories/participations-for-campaign-management-repository');
const participationsForUserManagementRepository = require('../../infrastructure/repositories/participations-for-user-management-repository');
const userOrganizationsForAdminRepository = require('../../infrastructure/repositories/user-organizations-for-admin-repository');
const partnerCertificationScoringRepository = require('../../infrastructure/repositories/partner-certification-scoring-repository');
const passwordGenerator = require('../../domain/services/password-generator');
const pickChallengeService = require('../services/pick-challenge-service');
const pixAuthenticationService = require('../../domain/services/authentication/pix-authentication-service');
const placementProfileService = require('../../domain/services/placement-profile-service');
const poleEmploiSendingRepository = require('../../infrastructure/repositories/pole-emploi-sending-repository');
const poleEmploiNotifier = require('../../infrastructure/externals/pole-emploi/pole-emploi-notifier');
const prescriberRepository = require('../../infrastructure/repositories/prescriber-repository');
const resetPasswordService = require('../../domain/services/reset-password-service');
const resetPasswordDemandRepository = require('../../infrastructure/repositories/reset-password-demands-repository');
const scoAccountRecoveryService = require('../services/sco-account-recovery-service');
const scoCertificationCandidateRepository = require('../../infrastructure/repositories/sco-certification-candidate-repository');
const scoOrganizationParticipantRepository = require('../../infrastructure/repositories/sco-organization-participant-repository');
const scorecardService = require('../../domain/services/scorecard-service');
const scoringCertificationService = require('../../domain/services/scoring/scoring-certification-service');
const supOrganizationParticipantRepository = require('../../infrastructure/repositories/sup-organization-participant-repository');
const sessionForAttendanceSheetRepository = require('../../infrastructure/repositories/sessions/session-for-attendance-sheet-repository');
const sessionsImportValidationService = require('../../domain/services/sessions-import-validation-service');
const sessionPublicationService = require('../../domain/services/session-publication-service');
const sessionRepository = require('../../infrastructure/repositories/sessions/session-repository');
const sessionForSupervisingRepository = require('../../infrastructure/repositories/sessions/session-for-supervising-repository');
const sessionJuryCommentRepository = require('../../infrastructure/repositories/sessions/session-jury-comment-repository');
const sessionSummaryRepository = require('../../infrastructure/repositories/sessions/session-summary-repository');
const settings = require('../../config');
const skillRepository = require('../../infrastructure/repositories/skill-repository');
const skillSetRepository = require('../../infrastructure/repositories/skill-set-repository');
const studentRepository = require('../../infrastructure/repositories/student-repository');
const supervisorAccessRepository = require('../../infrastructure/repositories/supervisor-access-repository');
const tagRepository = require('../../infrastructure/repositories/tag-repository');
const TargetProfileForSpecifierRepository = require('../../infrastructure/repositories/campaign/target-profile-for-specifier-repository');
const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository');
const targetProfileSummaryForAdminRepository = require('../../infrastructure/repositories/target-profile-summary-for-admin-repository');
const targetProfileForUpdateRepository = require('../../infrastructure/repositories/target-profile-for-update-repository');
const targetProfileShareRepository = require('../../infrastructure/repositories/target-profile-share-repository');
const targetProfileForAdminRepository = require('../../infrastructure/repositories/target-profile-for-admin-repository');
const targetProfileTrainingRepository = require('../../infrastructure/repositories/target-profile-training-repository');
const thematicRepository = require('../../infrastructure/repositories/thematic-repository');
const tokenService = require('../../domain/services/token-service');
const refreshTokenService = require('../../domain/services/refresh-token-service');
const trainingRepository = require('../../infrastructure/repositories/training-repository');
const trainingTriggerRepository = require('../../infrastructure/repositories/training-trigger-repository');
const tubeRepository = require('../../infrastructure/repositories/tube-repository');
const tutorialEvaluationRepository = require('../../infrastructure/repositories/tutorial-evaluation-repository');
const tutorialRepository = require('../../infrastructure/repositories/tutorial-repository');
const userEmailRepository = require('../../infrastructure/repositories/user-email-repository');
const userLoginRepository = require('../../infrastructure/repositories/user-login-repository');
const userOrgaSettingsRepository = require('../../infrastructure/repositories/user-orga-settings-repository');
const userRecommendedTrainingRepository = require('../../infrastructure/repositories/user-recommended-training-repository');
const userReconciliationService = require('../services/user-reconciliation-service');
const userToCreateRepository = require('../../infrastructure/repositories/user-to-create-repository');
const userRepository = require('../../infrastructure/repositories/user-repository');
const userService = require('../../domain/services/user-service');
const userSavedTutorialRepository = require('../../infrastructure/repositories/user-saved-tutorial-repository');
const verifyCertificateCodeService = require('../../domain/services/verify-certificate-code-service');

const participantResultsSharedRepository = require('../../infrastructure/repositories/participant-results-shared-repository');
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
  poleEmploiNotifier,
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

const { injectDependencies } = require('../../infrastructure/utils/dependency-injection');

const abortCertificationCourse = require('./abort-certification-course');
const acceptCertificationCenterInvitation = require('./accept-certification-center-invitation');
const acceptOrganizationInvitation = require('./accept-organization-invitation');
const acceptPixCertifTermsOfService = require('./accept-pix-certif-terms-of-service');
const acceptPixLastTermsOfService = require('./accept-pix-last-terms-of-service');
const acceptPixOrgaTermsOfService = require('./accept-pix-orga-terms-of-service');
const addCertificationCandidateToSession = require('./add-certification-candidate-to-session');
const addPixAuthenticationMethodByEmail = require('./add-pix-authentication-method-by-email');
const addTutorialEvaluation = require('./add-tutorial-evaluation');
const addTutorialToUser = require('./add-tutorial-to-user');
const anonymizeUser = require('./anonymize-user');
const archiveCampaign = require('./archive-campaign');
const archiveOrganization = require('./archive-organization');
const assignCertificationOfficerToJurySession = require('./assign-certification-officer-to-jury-session');
const attachOrganizationsFromExistingTargetProfile = require('./attach-organizations-from-existing-target-profile');
const attachOrganizationsToTargetProfile = require('./attach-organizations-to-target-profile');
const attachTargetProfilesToOrganization = require('./attach-target-profiles-to-organization');
const attachTargetProfilesToTraining = require('./attach-target-profiles-to-training');
const authenticateAnonymousUser = require('./authenticate-anonymous-user');
const authenticateApplication = require('./authenticate-application');
const authenticateExternalUser = require('./authenticate-external-user');
const authenticateOidcUser = require('./authentication/authenticate-oidc-user');
const authenticateUser = require('./authenticate-user');
const authorizeCertificationCandidateToResume = require('./authorize-certification-candidate-to-resume');
const authorizeCertificationCandidateToStart = require('./authorize-certification-candidate-to-start');
const beginCampaignParticipationImprovement = require('./begin-campaign-participation-improvement');
const campaignAdministrationArchiveCampaign = require('./campaigns-administration/archive-campaigns');
const cancelCertificationCenterInvitation = require('./cancel-certification-center-invitation');
const cancelCertificationCourse = require('./cancel-certification-course');
const cancelOrganizationInvitation = require('./cancel-organization-invitation');
const changeUserLang = require('./change-user-lang');
const checkScoAccountRecovery = require('./check-sco-account-recovery');
const commentSessionAsJury = require('./comment-session-as-jury');
const completeAssessment = require('./complete-assessment');
const computeCampaignAnalysis = require('./compute-campaign-analysis');
const computeCampaignCollectiveResult = require('./compute-campaign-collective-result');
const computeCampaignParticipationAnalysis = require('./compute-campaign-participation-analysis');
const correctAnswerThenUpdateAssessment = require('./correct-answer-then-update-assessment');
const correctCandidateIdentityInCertificationCourse = require('./correct-candidate-identity-in-certification-course');
const createAccessTokenFromRefreshToken = require('./create-access-token-from-refresh-token');
const createAndReconcileUserToOrganizationLearner = require('./create-and-reconcile-user-to-organization-learner');
const createBadge = require('./create-badge');
const createCampaign = require('./create-campaign');
const createCertificationCenter = require('./create-certification-center');
const createCertificationCenterMembershipByEmail = require('./create-certification-center-membership-by-email');
const createCertificationCenterMembershipForScoOrganizationMember = require('./create-certification-center-membership-for-sco-organization-member');
const createLcmsRelease = require('./create-lcms-release');
const createMembership = require('./create-membership');
const createOidcUser = require('./create-oidc-user');
const createOrUpdateCertificationCenterInvitationForAdmin = require('./create-or-update-certification-center-invitation-for-admin');
const createOrUpdateTrainingTrigger = require('./create-or-update-training-trigger');
const createOrUpdateUserOrgaSettings = require('./create-or-update-user-orga-settings');
const createOrganization = require('./create-organization');
const createOrganizationInvitationByAdmin = require('./create-organization-invitation-by-admin');
const createOrganizationInvitations = require('./create-organization-invitations');
const resendOrganizationInvitation = require('./resend-organization-invitation');
const createOrganizationPlacesLot = require('./create-organization-places-lot');
const createOrganizationsWithTagsAndTargetProfiles = require('./create-organizations-with-tags-and-target-profiles');
const createPasswordResetDemand = require('./create-password-reset-demand');
const createSession = require('./create-session');
const createSessions = require('./create-sessions');
const createStage = require('./create-stage');
const createTag = require('./create-tag');
const createTargetProfile = require('./create-target-profile');
const createTraining = require('./create-training');
const createUser = require('./create-user');
const createUserAndReconcileToOrganizationLearnerFromExternalUser = require('./create-user-and-reconcile-to-organization-learner-from-external-user');
const deactivateAdminMember = require('./deactivate-admin-member');
const deleteCampaignParticipation = require('./delete-campaign-participation');
const deleteCampaignParticipationForAdmin = require('./delete-campaign-participation-for-admin');
const deleteCertificationIssueReport = require('./delete-certification-issue-report');
const deleteOrganizationPlaceLot = require('./delete-organization-place-lot');
const deleteSession = require('./delete-session');
const deleteSessionJuryComment = require('./delete-session-jury-comment');
const deleteUnassociatedBadge = require('./delete-unassociated-badge');
const deleteUnlinkedCertificationCandidate = require('./delete-unlinked-certification-candidate');
const deneutralizeChallenge = require('./deneutralize-challenge');
const disableCertificationCenterMembership = require('./disable-certification-center-membership');
const disableMembership = require('./disable-membership');
const dissociateUserFromOrganizationLearner = require('./dissociate-user-from-organization-learner');
const endAssessmentBySupervisor = require('./end-assessment-by-supervisor');
const enrollStudentsToSession = require('./enroll-students-to-session');
const finalizeSession = require('./finalize-session');
const findAllTags = require('./find-all-tags');
const findAnswerByAssessment = require('./find-answer-by-assessment');
const findAnswerByChallengeAndAssessment = require('./find-answer-by-challenge-and-assessment');
const findAssessmentParticipationResultList = require('./find-assessment-participation-result-list');
const findAssociationBetweenUserAndOrganizationLearner = require('./find-association-between-user-and-organization-learner');
const findCampaignParticipationTrainings = require('./find-campaign-participation-trainings');
const findCampaignParticipationsForUserManagement = require('./find-campaign-participations-for-user-management');
const findCampaignProfilesCollectionParticipationSummaries = require('./find-campaign-profiles-collection-participation-summaries');
const findCertificationAttestationsForDivision = require('./certificate/find-certification-attestations-for-division');
const findCertificationCenterMembershipsByCertificationCenter = require('./find-certification-center-memberships-by-certification-center');
const findCertificationCenterMembershipsByUser = require('./find-certification-center-memberships-by-user');
const findCompetenceEvaluationsByAssessment = require('./find-competence-evaluations-by-assessment');
const findComplementaryCertifications = require('./find-complementary-certifications');
const findCountries = require('./find-countries');
const findDivisionsByCertificationCenter = require('./find-divisions-by-certification-center');
const findDivisionsByOrganization = require('./find-divisions-by-organization');
const findFinalizedSessionsToPublish = require('./find-finalized-sessions-to-publish');
const findFinalizedSessionsWithRequiredAction = require('./find-finalized-sessions-with-required-action');
const findGroupsByOrganization = require('./find-groups-by-organization');
const findLatestOngoingUserCampaignParticipations = require('./find-latest-ongoing-user-campaign-participations');
const findOrganizationPlacesLot = require('./find-organization-places-lot');
const findOrganizationTargetProfileSummariesForAdmin = require('./find-organization-target-profile-summaries-for-admin');
const findPaginatedCampaignManagements = require('./find-paginated-campaign-managements');
const findPaginatedCampaignParticipantsActivities = require('./find-paginated-campaign-participants-activities');
const findPaginatedCertificationCenterSessionSummaries = require('./find-paginated-certification-center-session-summaries');
const findPaginatedFilteredCertificationCenters = require('./find-paginated-filtered-certification-centers');
const findPaginatedFilteredOrganizationCampaigns = require('./find-paginated-filtered-organization-campaigns');
const findPaginatedFilteredOrganizationMemberships = require('./find-paginated-filtered-organization-memberships');
const findPaginatedFilteredOrganizations = require('./find-paginated-filtered-organizations');
const findPaginatedFilteredScoParticipants = require('./find-paginated-filtered-sco-participants');
const findPaginatedFilteredSupParticipants = require('./find-paginated-filtered-sup-participants');
const findPaginatedFilteredTargetProfileOrganizations = require('./find-paginated-filtered-target-profile-organizations');
const findPaginatedFilteredTargetProfileSummariesForAdmin = require('./find-paginated-filtered-target-profile-summaries-for-admin');
const findPaginatedFilteredTutorials = require('./find-paginated-filtered-tutorials');
const findPaginatedFilteredUsers = require('./find-paginated-filtered-users');
const findPaginatedParticipationsForCampaignManagement = require('./find-paginated-participations-for-campaign-management');
const findPaginatedTrainingSummaries = require('./find-paginated-training-summaries');
const findPaginatedUserRecommendedTrainings = require('./find-paginated-user-recommended-trainings');
const findPendingCertificationCenterInvitations = require('./find-pending-certification-center-invitations');
const findPendingOrganizationInvitations = require('./find-pending-organization-invitations');
const findStudentsForEnrollment = require('./find-students-for-enrollment');
const findTargetProfileStages = require('./find-target-profile-stages');
const findTargetProfileSummariesForTraining = require('./find-target-profile-summaries-for-training');
const findTutorials = require('./find-tutorials');
const findUserAuthenticationMethods = require('./find-user-authentication-methods');
const findUserCampaignParticipationOverviews = require('./find-user-campaign-participation-overviews');
const findUserForOidcReconciliation = require('./find-user-for-oidc-reconciliation');
const findUserOrganizationsForAdmin = require('./find-user-organizations-for-admin');
const findUserPrivateCertificates = require('./find-user-private-certificates');
const flagSessionResultsAsSentToPrescriber = require('./flag-session-results-as-sent-to-prescriber');
const generateUsername = require('./generate-username');
const generateUsernameWithTemporaryPassword = require('./generate-username-with-temporary-password');
const getAccountRecoveryDetails = require('./account-recovery/get-account-recovery-details');
const getAdminMemberDetails = require('./get-admin-member-details');
const getAdminMembers = require('./get-admin-members');
const getAnswer = require('./get-answer');
const getAssessment = require('./get-assessment');
const getAttendanceSheet = require('./get-attendance-sheet');
const getAvailableTargetProfilesForOrganization = require('./get-available-target-profiles-for-organization');
const getCampaign = require('./get-campaign');
const getCampaignAssessmentParticipation = require('./get-campaign-assessment-participation');
const getCampaignAssessmentParticipationResult = require('./get-campaign-assessment-participation-result');
const getCampaignByCode = require('./get-campaign-by-code');
const getCampaignDetailsManagement = require('./get-campaign-details-management');
const getCampaignParticipationsActivityByDay = require('./get-campaign-participations-activity-by-day');
const getCampaignParticipationsCountByStage = require('./get-campaign-participations-counts-by-stage');
const getCampaignParticipationsCountsByStatus = require('./get-campaign-participations-counts-by-status');
const getCampaignProfile = require('./get-campaign-profile');
const getCandidateImportSheetData = require('./get-candidate-import-sheet-data');
const getCertificationAttestation = require('./certificate/get-certification-attestation');
const getCertificationCandidate = require('./get-certification-candidate');
const getCertificationCandidateSubscription = require('./get-certification-candidate-subscription');
const getCertificationCenter = require('./get-certification-center');
const getCertificationCenterForAdmin = require('./get-certification-center-for-admin');
const getCertificationCenterInvitation = require('./get-certification-center-invitation');
const getCertificationCourse = require('./get-certification-course');
const getCertificationDetails = require('./get-certification-details');
const getCertificationPointOfContact = require('./get-certification-point-of-contact');
const getCertificationsResultsForLS = require('./certificate/get-certifications-results-for-ls');
const getChallengeForPixAutoAnswer = require('./get-challenge-for-pix-auto-answer');
const getCleaCertifiedCandidateBySession = require('./get-clea-certified-candidate-by-session');
const getCorrectionForAnswer = require('./get-correction-for-answer');
const getCurrentUser = require('./get-current-user');
const getExternalAuthenticationRedirectionUrl = require('./get-external-authentication-redirection-url');
const getFrameworkAreas = require('./get-framework-areas');
const getFrameworks = require('./get-frameworks');
const getIdentityProviders = require('./get-identity-providers');
const getImportSessionComplementaryCertificationHabilitationsLabels = require('./get-import-session-complementary-certification-habilitations-labels');
const getJuryCertification = require('./get-jury-certification');
const getJurySession = require('./get-jury-session');
const getLastChallengeIdFromAssessmentId = require('./get-last-challenge-id-from-assessment-id');
const getLearningContentByTargetProfile = require('./get-learning-content-by-target-profile');
const getLearningContentForTargetProfileSubmission = require('./get-learning-content-for-target-profile-submission');
const getNextChallengeForCampaignAssessment = require('./get-next-challenge-for-campaign-assessment');
const getNextChallengeForCertification = require('./get-next-challenge-for-certification');
const getNextChallengeForCompetenceEvaluation = require('./get-next-challenge-for-competence-evaluation');
const getNextChallengeForDemo = require('./get-next-challenge-for-demo');
const getNextChallengeForPreview = require('./get-next-challenge-for-preview');
const getOrganizationDetails = require('./get-organization-details');
const getOrganizationInvitation = require('./get-organization-invitation');
const getOrganizationLearner = require('./get-organization-learner');
const getOrganizationLearnerActivity = require('./get-organization-learner-activity');
const getOrganizationLearnersCsvTemplate = require('./get-organization-learners-csv-template');
const getOrganizationMemberIdentities = require('./get-organization-members-identity');
const getOrganizationPlacesCapacity = require('./get-organization-places-capacity');
const getPaginatedParticipantsForAnOrganization = require('./get-paginated-participants-for-an-organization');
const getParticipantsDivision = require('./get-participants-division');
const getParticipantsGroup = require('./get-participants-group');
const getParticipationsCountByMasteryRate = require('./get-participations-count-by-mastery-rate');
const getPoleEmploiSendings = require('./get-pole-emploi-sendings');
const getPrescriber = require('./get-prescriber');
const getPrivateCertificate = require('./certificate/get-private-certificate');
const getProgression = require('./get-progression');
const getRecentlyUsedTags = require('./get-recently-used-tags');
const getScoCertificationResultsByDivision = require('./get-sco-certification-results-by-division');
const getScorecard = require('./get-scorecard');
const getSession = require('./get-session');
const getSessionCertificationCandidates = require('./get-session-certification-candidates');
const getSessionCertificationReports = require('./get-session-certification-reports');
const getSessionForSupervising = require('./get-session-for-supervising');
const getSessionResults = require('./get-session-results');
const getSessionResultsByResultRecipientEmail = require('./get-session-results-by-result-recipient-email');
const getShareableCertificate = require('./certificate/get-shareable-certificate');
const getSupervisorKitSessionInfo = require('./get-supervisor-kit-session-info');
const getTargetProfileContentAsJson = require('./get-target-profile-content-as-json');
const getTargetProfileForAdmin = require('./get-target-profile-for-admin');
const getTraining = require('./get-training');
const getUserByResetPasswordDemand = require('./get-user-by-reset-password-demand');
const getUserCampaignAssessmentResult = require('./get-user-campaign-assessment-result');
const getUserCampaignParticipationToCampaign = require('./get-user-campaign-participation-to-campaign');
const getUserCertificationEligibility = require('./get-user-certification-eligibility');
const getUserDetailsForAdmin = require('./get-user-details-for-admin');
const getUserProfile = require('./get-user-profile');
const getUserProfileSharedForCampaign = require('./get-user-profile-shared-for-campaign');
const handleBadgeAcquisition = require('./handle-badge-acquisition');
const handleTrainingRecommendation = require('./handle-training-recommendation');
const importCertificationCandidatesFromCandidatesImportSheet = require('./import-certification-candidates-from-candidates-import-sheet');
const importOrganizationLearnersFromSIECLEFormat = require('./import-organization-learners-from-siecle');
const importSupOrganizationLearners = require('./import-sup-organization-learners');
const improveCompetenceEvaluation = require('./improve-competence-evaluation');
const linkUserToSessionCertificationCandidate = require('./link-user-to-session-certification-candidate');
const manuallyResolveCertificationIssueReport = require('./manually-resolve-certification-issue-report');
const markTargetProfileAsSimplifiedAccess = require('./mark-target-profile-as-simplified-access');
const neutralizeChallenge = require('./neutralize-challenge');
const outdateTargetProfile = require('./outdate-target-profile');
const publishSession = require('./publish-session');
const publishSessionsInBatch = require('./publish-sessions-in-batch');
const reassignAuthenticationMethodToAnotherUser = require('./reassign-authentication-method-to-another-user');
const reconcileOidcUser = require('./reconcile-oidc-user');
const reconcileScoOrganizationLearnerAutomatically = require('./reconcile-sco-organization-learner-automatically');
const reconcileScoOrganizationLearnerManually = require('./reconcile-sco-organization-learner-manually');
const reconcileSupOrganizationLearner = require('./reconcile-sup-organization-learner');
const rememberUserHasSeenAssessmentInstructions = require('./remember-user-has-seen-assessment-instructions');
const rememberUserHasSeenChallengeTooltip = require('./remember-user-has-seen-challenge-tooltip');
const rememberUserHasSeenLastDataProtectionPolicyInformation = require('./remember-user-has-seen-last-data-protection-policy-information');
const rememberUserHasSeenNewDashboardInfo = require('./remember-user-has-seen-new-dashboard-info');
const removeAuthenticationMethod = require('./remove-authentication-method');
const replaceSupOrganizationLearners = require('./replace-sup-organization-learner');
const resetScorecard = require('./reset-scorecard');
const retrieveLastOrCreateCertificationCourse = require('./retrieve-last-or-create-certification-course');
const revokeRefreshToken = require('./revoke-refresh-token');
const saveAdminMember = require('./save-admin-member');
const saveCertificationIssueReport = require('./save-certification-issue-report');
const saveComputedCampaignParticipationResult = require('./save-computed-campaign-participation-result');
const saveJuryComplementaryCertificationCourseResult = require('./save-jury-complementary-certification-course-result');
const sendEmailForAccountRecovery = require('./account-recovery/send-email-for-account-recovery');
const sendScoInvitation = require('./send-sco-invitation');
const sendSharedParticipationResultsToPoleEmploi = require('./send-shared-participation-results-to-pole-emploi');
const sendVerificationCode = require('./send-verification-code');
const shareCampaignResult = require('./share-campaign-result');
const simulateFlashScoring = require('./simulate-flash-scoring');
const simulateOldScoring = require('./simulate-old-scoring');
const startCampaignParticipation = require('./start-campaign-participation');
const startOrResumeCompetenceEvaluation = require('./start-or-resume-competence-evaluation');
const startWritingCampaignAssessmentResultsToStream = require('./start-writing-campaign-assessment-results-to-stream');
const startWritingCampaignProfilesCollectionResultsToStream = require('./start-writing-campaign-profiles-collection-results-to-stream');
const superviseSession = require('./supervise-session');
const unarchiveCampaign = require('./unarchive-campaign');
const unblockUserAccount = require('./unblock-user-account');
const uncancelCertificationCourse = require('./uncancel-certification-course');
const unpublishSession = require('./unpublish-session');
const updateAdminMember = require('./update-admin-member');
const updateBadge = require('./update-badge');
const updateCampaign = require('./update-campaign');
const updateCampaignDetailsManagement = require('./update-campaign-details-management');
const updateCertificationCenter = require('./update-certification-center');
const updateCertificationCenterReferer = require('./update-certification-center-referer');
const updateExpiredPassword = require('./update-expired-password');
const updateLastQuestionState = require('./update-last-question-state');
const updateMembership = require('./update-membership');
const updateOrganizationInformation = require('./update-organization-information');
const updateOrganizationLearnerDependentUserPassword = require('./update-organization-learner-dependent-user-password');
const updateParticipantExternalId = require('./update-participant-external-id');
const updateSession = require('./update-session');
const updateStage = require('./update-stage');
const updateStudentNumber = require('./update-student-number');
const updateTargetProfile = require('./update-target-profile');
const updateTraining = require('./update-training');
const updateUserDetailsForAdministration = require('./update-user-details-for-administration');
const updateUserEmailWithValidation = require('./update-user-email-with-validation');
const updateUserForAccountRecovery = require('./account-recovery/update-user-for-account-recovery');
const updateUserPassword = require('./update-user-password');

const usecases = {
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
  updateStudentNumber,
  updateTargetProfile,
  updateTraining,
  updateUserDetailsForAdministration,
  updateUserEmailWithValidation,
  updateUserForAccountRecovery,
  updateUserPassword,
};

module.exports = injectDependencies(usecases, dependencies);
