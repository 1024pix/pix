import { injectDependencies } from '../../infrastructure/utils/dependency-injection';

import accountRecoveryDemandRepository from '../../infrastructure/repositories/account-recovery-demand-repository';
import adminMemberRepository from '../../infrastructure/repositories/admin-member-repository';
import algorithmDataFetcherService from '../../domain/services/algorithm-methods/data-fetcher';
import answerRepository from '../../infrastructure/repositories/answer-repository';
import areaRepository from '../../infrastructure/repositories/area-repository';
import assessmentRepository from '../../infrastructure/repositories/assessment-repository';
import assessmentResultRepository from '../../infrastructure/repositories/assessment-result-repository';
import authenticationMethodRepository from '../../infrastructure/repositories/authentication-method-repository';
import authenticationServiceRegistry from '../services/authentication/authentication-service-registry';
import authenticationSessionService from '../../domain/services/authentication/authentication-session-service';
import badgeAcquisitionRepository from '../../infrastructure/repositories/badge-acquisition-repository';
import badgeCriteriaRepository from '../../infrastructure/repositories/badge-criteria-repository';
import badgeForCalculationRepository from '../../infrastructure/repositories/badge-for-calculation-repository';
import badgeRepository from '../../infrastructure/repositories/badge-repository';
import campaignAdministrationRepository from '../../infrastructure/repositories/campaigns-administration/campaign-repository';
import campaignAnalysisRepository from '../../infrastructure/repositories/campaign-analysis-repository';
import campaignAssessmentParticipationRepository from '../../infrastructure/repositories/campaign-assessment-participation-repository';
import campaignAssessmentParticipationResultListRepository from '../../infrastructure/repositories/campaign-assessment-participation-result-list-repository';
import campaignAssessmentParticipationResultRepository from '../../infrastructure/repositories/campaign-assessment-participation-result-repository';
import campaignCreatorRepository from '../../infrastructure/repositories/campaign-creator-repository';
import campaignForArchivingRepository from '../../infrastructure/repositories/campaign/campaign-for-archiving-repository';
import campaignParticipantActivityRepository from '../../infrastructure/repositories/campaign-participant-activity-repository';
import campaignCollectiveResultRepository from '../../infrastructure/repositories/campaign-collective-result-repository';
import campaignManagementRepository from '../../infrastructure/repositories/campaign-management-repository';
import campaignParticipationInfoRepository from '../../infrastructure/repositories/campaign-participation-info-repository';
import campaignParticipantRepository from '../../infrastructure/repositories/campaign-participant-repository';
import campaignParticipationOverviewRepository from '../../infrastructure/repositories/campaign-participation-overview-repository';
import campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository';
import campaignParticipationResultRepository from '../../infrastructure/repositories/campaign-participation-result-repository';
import campaignParticipationsStatsRepository from '../../infrastructure/repositories/campaign-participations-stats-repository';
import campaignProfilesCollectionParticipationSummaryRepository from '../../infrastructure/repositories/campaign-profiles-collection-participation-summary-repository';
import campaignProfileRepository from '../../infrastructure/repositories/campaign-profile-repository';
import campaignReportRepository from '../../infrastructure/repositories/campaign-report-repository';
import campaignRepository from '../../infrastructure/repositories/campaign-repository';
import campaignToJoinRepository from '../../infrastructure/repositories/campaign-to-join-repository';
import campaignCsvExportService from '../../domain/services/campaign-csv-export-service';
import certificateRepository from '../../infrastructure/repositories/certificate-repository';
import certificationAssessmentRepository from '../../infrastructure/repositories/certification-assessment-repository';
import certificationAttestationPdf from '../../infrastructure/utils/pdf/certification-attestation-pdf';
import certificationBadgesService from '../../domain/services/certification-badges-service';
import certificationCandidateRepository from '../../infrastructure/repositories/certification-candidate-repository';
import certificationCandidateForSupervisingRepository from '../../infrastructure/repositories/certification-candidate-for-supervising-repository';
import certificationCandidatesOdsService from '../../domain/services/certification-candidates-ods-service';
import certificationCenterInvitationRepository from '../../infrastructure/repositories/certification-center-invitation-repository';
import certificationCenterInvitedUserRepository from '../../infrastructure/repositories/certification-center-invited-user-repository';
import certificationCenterMembershipRepository from '../../infrastructure/repositories/certification-center-membership-repository';
import certificationCenterForAdminRepository from '../../infrastructure/repositories/certification-center-for-admin-repository';
import certificationCenterRepository from '../../infrastructure/repositories/certification-center-repository';
import certificationChallengeRepository from '../../infrastructure/repositories/certification-challenge-repository';
import certificationChallengesService from '../../domain/services/certification-challenges-service';
import certificationCourseRepository from '../../infrastructure/repositories/certification-course-repository';
import certificationCpfCityRepository from '../../infrastructure/repositories/certification-cpf-city-repository';
import certificationCpfCountryRepository from '../../infrastructure/repositories/certification-cpf-country-repository';
import certificationIssueReportRepository from '../../infrastructure/repositories/certification-issue-report-repository';
import certificationLsRepository from '../../infrastructure/repositories/certification-livret-scolaire-repository';
import certificationOfficerRepository from '../../infrastructure/repositories/certification-officer-repository';
import certificationPointOfContactRepository from '../../infrastructure/repositories/certification-point-of-contact-repository';
import certificationReportRepository from '../../infrastructure/repositories/certification-report-repository';
import certificationRepository from '../../infrastructure/repositories/certification-repository';
import certificationCpfService from '../../domain/services/certification-cpf-service';
import certificationResultRepository from '../../infrastructure/repositories/certification-result-repository';
import challengeRepository from '../../infrastructure/repositories/challenge-repository';
import challengeForPixAutoAnswerRepository from '../../infrastructure/repositories/challenge-for-pix-auto-answer-repository';
import cleaCertifiedCandidateRepository from '../../infrastructure/repositories/clea-certified-candidate-repository';
import competenceEvaluationRepository from '../../infrastructure/repositories/competence-evaluation-repository';
import competenceMarkRepository from '../../infrastructure/repositories/competence-mark-repository';
import competenceRepository from '../../infrastructure/repositories/competence-repository';
import competenceTreeRepository from '../../infrastructure/repositories/competence-tree-repository';
import complementaryCertificationHabilitationRepository from '../../infrastructure/repositories/complementary-certification-habilitation-repository';
import complementaryCertificationRepository from '../../infrastructure/repositories/complementary-certification-repository';
import complementaryCertificationSubscriptionRepository from '../../infrastructure/repositories/complementary-certification-subscription-repository';
import complementaryCertificationCourseResultRepository from '../../infrastructure/repositories/complementary-certification-course-result-repository';
import correctionRepository from '../../infrastructure/repositories/correction-repository';
import countryRepository from '../../infrastructure/repositories/country-repository';
import courseRepository from '../../infrastructure/repositories/course-repository';
import cpfCertificationResultRepository from '../../infrastructure/repositories/cpf-certification-result-repository';
import dataProtectionOfficerRepository from '../../infrastructure/repositories/data-protection-officer-repository';
import divisionRepository from '../../infrastructure/repositories/division-repository';
import encryptionService from '../../domain/services/encryption-service';
import flashAssessmentResultRepository from '../../infrastructure/repositories/flash-assessment-result-repository';
import flashAlgorithmService from '../../domain/services/algorithm-methods/flash';
import frameworkRepository from '../../infrastructure/repositories/framework-repository';
import getCompetenceLevel from '../../domain/services/get-competence-level';
import sessionForSupervisorKitRepository from '../../infrastructure/repositories/sessions/session-for-supervisor-kit-repository';
import groupRepository from '../../infrastructure/repositories/group-repository';
import finalizedSessionRepository from '../../infrastructure/repositories/sessions/finalized-session-repository';
import supOrganizationLearnerRepository from '../../infrastructure/repositories/sup-organization-learner-repository';
import improvementService from '../../domain/services/improvement-service';
import issueReportCategoryRepository from '../../infrastructure/repositories/issue-report-category-repository';
import juryCertificationRepository from '../../infrastructure/repositories/jury-certification-repository';
import juryCertificationSummaryRepository from '../../infrastructure/repositories/jury-certification-summary-repository';
import jurySessionRepository from '../../infrastructure/repositories/sessions/jury-session-repository';
import knowledgeElementRepository from '../../infrastructure/repositories/knowledge-element-repository';
import learningContentRepository from '../../infrastructure/repositories/learning-content-repository';
import mailService from '../../domain/services/mail-service';
import membershipRepository from '../../infrastructure/repositories/membership-repository';
import obfuscationService from '../../domain/services/obfuscation-service';
import organizationMemberIdentityRepository from '../../infrastructure/repositories/organization-member-identity-repository';
import organizationForAdminRepository from '../../infrastructure/repositories/organization-for-admin-repository';
import organizationRepository from '../../infrastructure/repositories/organization-repository';
import organizationPlacesLotRepository from '../../infrastructure/repositories/organizations/organization-places-lot-repository';
import organizationPlacesCapacityRepository from '../../infrastructure/repositories/organization-places-capacity-repository';
import organizationInvitationRepository from '../../infrastructure/repositories/organization-invitation-repository';
import organizationInvitedUserRepository from '../../infrastructure/repositories/organization-invited-user-repository';
import organizationTagRepository from '../../infrastructure/repositories/organization-tag-repository';
import organizationsToAttachToTargetProfileRepository from '../../infrastructure/repositories/organizations-to-attach-to-target-profile-repository';
import organizationLearnerFollowUpRepository from '../../infrastructure/repositories/organization-learner-follow-up/organization-learner-repository';
import organizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository';
import organizationParticipantRepository from '../../infrastructure/repositories/organization-participant-repository';
import organizationLearnerActivityRepository from '../../infrastructure/repositories/organization-learner-activity-repository';
import organizationLearnersCsvService from '../../domain/services/organization-learners-csv-service';
import organizationLearnersXmlService from '../../domain/services/organization-learners-xml-service';
import participantResultRepository from '../../infrastructure/repositories/participant-result-repository';
import participationsForCampaignManagementRepository from '../../infrastructure/repositories/participations-for-campaign-management-repository';
import participationsForUserManagementRepository from '../../infrastructure/repositories/participations-for-user-management-repository';
import userOrganizationsForAdminRepository from '../../infrastructure/repositories/user-organizations-for-admin-repository';
import partnerCertificationScoringRepository from '../../infrastructure/repositories/partner-certification-scoring-repository';
import passwordGenerator from '../../domain/services/password-generator';
import pickChallengeService from '../services/pick-challenge-service';
import pixAuthenticationService from '../../domain/services/authentication/pix-authentication-service';
import placementProfileService from '../../domain/services/placement-profile-service';
import poleEmploiSendingRepository from '../../infrastructure/repositories/pole-emploi-sending-repository';
import poleEmploiNotifier from '../../infrastructure/externals/pole-emploi/pole-emploi-notifier';
import prescriberRepository from '../../infrastructure/repositories/prescriber-repository';
import resetPasswordService from '../../domain/services/reset-password-service';
import resetPasswordDemandRepository from '../../infrastructure/repositories/reset-password-demands-repository';
import scoAccountRecoveryService from '../services/sco-account-recovery-service';
import scoCertificationCandidateRepository from '../../infrastructure/repositories/sco-certification-candidate-repository';
import scoOrganizationParticipantRepository from '../../infrastructure/repositories/sco-organization-participant-repository';
import scorecardService from '../../domain/services/scorecard-service';
import scoringCertificationService from '../../domain/services/scoring/scoring-certification-service';
import supOrganizationParticipantRepository from '../../infrastructure/repositories/sup-organization-participant-repository';
import sessionForAttendanceSheetRepository from '../../infrastructure/repositories/sessions/session-for-attendance-sheet-repository';
import sessionsImportValidationService from '../../domain/services/sessions-import-validation-service';
import sessionPublicationService from '../../domain/services/session-publication-service';
import sessionRepository from '../../infrastructure/repositories/sessions/session-repository';
import sessionForSupervisingRepository from '../../infrastructure/repositories/sessions/session-for-supervising-repository';
import sessionJuryCommentRepository from '../../infrastructure/repositories/sessions/session-jury-comment-repository';
import sessionSummaryRepository from '../../infrastructure/repositories/sessions/session-summary-repository';
import settings from '../../config';
import skillRepository from '../../infrastructure/repositories/skill-repository';
import skillSetRepository from '../../infrastructure/repositories/skill-set-repository';
import studentRepository from '../../infrastructure/repositories/student-repository';
import supervisorAccessRepository from '../../infrastructure/repositories/supervisor-access-repository';
import tagRepository from '../../infrastructure/repositories/tag-repository';
import TargetProfileForSpecifierRepository from '../../infrastructure/repositories/campaign/target-profile-for-specifier-repository';
import targetProfileRepository from '../../infrastructure/repositories/target-profile-repository';
import targetProfileSummaryForAdminRepository from '../../infrastructure/repositories/target-profile-summary-for-admin-repository';
import targetProfileForUpdateRepository from '../../infrastructure/repositories/target-profile-for-update-repository';
import targetProfileShareRepository from '../../infrastructure/repositories/target-profile-share-repository';
import targetProfileForAdminRepository from '../../infrastructure/repositories/target-profile-for-admin-repository';
import targetProfileTrainingRepository from '../../infrastructure/repositories/target-profile-training-repository';
import thematicRepository from '../../infrastructure/repositories/thematic-repository';
import tokenService from '../../domain/services/token-service';
import refreshTokenService from '../../domain/services/refresh-token-service';
import trainingRepository from '../../infrastructure/repositories/training-repository';
import trainingTriggerRepository from '../../infrastructure/repositories/training-trigger-repository';
import tubeRepository from '../../infrastructure/repositories/tube-repository';
import tutorialEvaluationRepository from '../../infrastructure/repositories/tutorial-evaluation-repository';
import tutorialRepository from '../../infrastructure/repositories/tutorial-repository';
import userEmailRepository from '../../infrastructure/repositories/user-email-repository';
import userLoginRepository from '../../infrastructure/repositories/user-login-repository';
import userOrgaSettingsRepository from '../../infrastructure/repositories/user-orga-settings-repository';
import userRecommendedTrainingRepository from '../../infrastructure/repositories/user-recommended-training-repository';
import userReconciliationService from '../services/user-reconciliation-service';
import userToCreateRepository from '../../infrastructure/repositories/user-to-create-repository';
import userRepository from '../../infrastructure/repositories/user-repository';
import userService from '../../domain/services/user-service';
import userSavedTutorialRepository from '../../infrastructure/repositories/user-saved-tutorial-repository';
import verifyCertificateCodeService from '../../domain/services/verify-certificate-code-service';

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

import abortCertificationCourse from './abort-certification-course';
import acceptCertificationCenterInvitation from './accept-certification-center-invitation';
import acceptOrganizationInvitation from './accept-organization-invitation';
import acceptPixCertifTermsOfService from './accept-pix-certif-terms-of-service';
import acceptPixLastTermsOfService from './accept-pix-last-terms-of-service';
import acceptPixOrgaTermsOfService from './accept-pix-orga-terms-of-service';
import addCertificationCandidateToSession from './add-certification-candidate-to-session';
import addPixAuthenticationMethodByEmail from './add-pix-authentication-method-by-email';
import addTutorialEvaluation from './add-tutorial-evaluation';
import addTutorialToUser from './add-tutorial-to-user';
import anonymizeUser from './anonymize-user';
import archiveCampaign from './archive-campaign';
import archiveOrganization from './archive-organization';
import assignCertificationOfficerToJurySession from './assign-certification-officer-to-jury-session';
import attachOrganizationsFromExistingTargetProfile from './attach-organizations-from-existing-target-profile';
import attachOrganizationsToTargetProfile from './attach-organizations-to-target-profile';
import attachTargetProfilesToOrganization from './attach-target-profiles-to-organization';
import attachTargetProfilesToTraining from './attach-target-profiles-to-training';
import authenticateAnonymousUser from './authenticate-anonymous-user';
import authenticateApplication from './authenticate-application';
import authenticateExternalUser from './authenticate-external-user';
import authenticateOidcUser from './authentication/authenticate-oidc-user';
import authenticateUser from './authenticate-user';
import authorizeCertificationCandidateToResume from './authorize-certification-candidate-to-resume';
import authorizeCertificationCandidateToStart from './authorize-certification-candidate-to-start';
import beginCampaignParticipationImprovement from './begin-campaign-participation-improvement';
import campaignAdministrationArchiveCampaign from './campaigns-administration/archive-campaigns';
import cancelCertificationCenterInvitation from './cancel-certification-center-invitation';
import cancelCertificationCourse from './cancel-certification-course';
import cancelOrganizationInvitation from './cancel-organization-invitation';
import changeUserLang from './change-user-lang';
import checkScoAccountRecovery from './check-sco-account-recovery';
import commentSessionAsJury from './comment-session-as-jury';
import completeAssessment from './complete-assessment';
import computeCampaignAnalysis from './compute-campaign-analysis';
import computeCampaignCollectiveResult from './compute-campaign-collective-result';
import computeCampaignParticipationAnalysis from './compute-campaign-participation-analysis';
import correctAnswerThenUpdateAssessment from './correct-answer-then-update-assessment';
import correctCandidateIdentityInCertificationCourse from './correct-candidate-identity-in-certification-course';
import createAccessTokenFromRefreshToken from './create-access-token-from-refresh-token';
import createAndReconcileUserToOrganizationLearner from './create-and-reconcile-user-to-organization-learner';
import createBadge from './create-badge';
import createCampaign from './create-campaign';
import createCertificationCenter from './create-certification-center';
import createCertificationCenterMembershipByEmail from './create-certification-center-membership-by-email';
import createCertificationCenterMembershipForScoOrganizationMember from './create-certification-center-membership-for-sco-organization-member';
import createLcmsRelease from './create-lcms-release';
import createMembership from './create-membership';
import createOidcUser from './create-oidc-user';
import createOrUpdateCertificationCenterInvitationForAdmin from './create-or-update-certification-center-invitation-for-admin';
import createOrUpdateTrainingTrigger from './create-or-update-training-trigger';
import createOrUpdateUserOrgaSettings from './create-or-update-user-orga-settings';
import createOrganization from './create-organization';
import createOrganizationInvitationByAdmin from './create-organization-invitation-by-admin';
import createOrganizationInvitations from './create-organization-invitations';
import resendOrganizationInvitation from './resend-organization-invitation';
import createOrganizationPlacesLot from './create-organization-places-lot';
import createOrganizationsWithTagsAndTargetProfiles from './create-organizations-with-tags-and-target-profiles';
import createPasswordResetDemand from './create-password-reset-demand';
import createSession from './create-session';
import createSessions from './create-sessions';
import createStage from './create-stage';
import createTag from './create-tag';
import createTargetProfile from './create-target-profile';
import createTraining from './create-training';
import createUser from './create-user';
import createUserAndReconcileToOrganizationLearnerFromExternalUser from './create-user-and-reconcile-to-organization-learner-from-external-user';
import deactivateAdminMember from './deactivate-admin-member';
import deleteCampaignParticipation from './delete-campaign-participation';
import deleteCampaignParticipationForAdmin from './delete-campaign-participation-for-admin';
import deleteCertificationIssueReport from './delete-certification-issue-report';
import deleteOrganizationPlaceLot from './delete-organization-place-lot';
import deleteSession from './delete-session';
import deleteSessionJuryComment from './delete-session-jury-comment';
import deleteUnassociatedBadge from './delete-unassociated-badge';
import deleteUnlinkedCertificationCandidate from './delete-unlinked-certification-candidate';
import deneutralizeChallenge from './deneutralize-challenge';
import disableCertificationCenterMembership from './disable-certification-center-membership';
import disableMembership from './disable-membership';
import dissociateUserFromOrganizationLearner from './dissociate-user-from-organization-learner';
import endAssessmentBySupervisor from './end-assessment-by-supervisor';
import enrollStudentsToSession from './enroll-students-to-session';
import finalizeSession from './finalize-session';
import findAllTags from './find-all-tags';
import findAnswerByAssessment from './find-answer-by-assessment';
import findAnswerByChallengeAndAssessment from './find-answer-by-challenge-and-assessment';
import findAssessmentParticipationResultList from './find-assessment-participation-result-list';
import findAssociationBetweenUserAndOrganizationLearner from './find-association-between-user-and-organization-learner';
import findCampaignParticipationTrainings from './find-campaign-participation-trainings';
import findCampaignParticipationsForUserManagement from './find-campaign-participations-for-user-management';
import findCampaignProfilesCollectionParticipationSummaries from './find-campaign-profiles-collection-participation-summaries';
import findCertificationAttestationsForDivision from './certificate/find-certification-attestations-for-division';
import findCertificationCenterMembershipsByCertificationCenter from './find-certification-center-memberships-by-certification-center';
import findCertificationCenterMembershipsByUser from './find-certification-center-memberships-by-user';
import findCompetenceEvaluationsByAssessment from './find-competence-evaluations-by-assessment';
import findComplementaryCertifications from './find-complementary-certifications';
import findCountries from './find-countries';
import findDivisionsByCertificationCenter from './find-divisions-by-certification-center';
import findDivisionsByOrganization from './find-divisions-by-organization';
import findFinalizedSessionsToPublish from './find-finalized-sessions-to-publish';
import findFinalizedSessionsWithRequiredAction from './find-finalized-sessions-with-required-action';
import findGroupsByOrganization from './find-groups-by-organization';
import findLatestOngoingUserCampaignParticipations from './find-latest-ongoing-user-campaign-participations';
import findOrganizationPlacesLot from './find-organization-places-lot';
import findOrganizationTargetProfileSummariesForAdmin from './find-organization-target-profile-summaries-for-admin';
import findPaginatedCampaignManagements from './find-paginated-campaign-managements';
import findPaginatedCampaignParticipantsActivities from './find-paginated-campaign-participants-activities';
import findPaginatedCertificationCenterSessionSummaries from './find-paginated-certification-center-session-summaries';
import findPaginatedFilteredCertificationCenters from './find-paginated-filtered-certification-centers';
import findPaginatedFilteredOrganizationCampaigns from './find-paginated-filtered-organization-campaigns';
import findPaginatedFilteredOrganizationMemberships from './find-paginated-filtered-organization-memberships';
import findPaginatedFilteredOrganizations from './find-paginated-filtered-organizations';
import findPaginatedFilteredScoParticipants from './find-paginated-filtered-sco-participants';
import findPaginatedFilteredSupParticipants from './find-paginated-filtered-sup-participants';
import findPaginatedFilteredTargetProfileOrganizations from './find-paginated-filtered-target-profile-organizations';
import findPaginatedFilteredTargetProfileSummariesForAdmin from './find-paginated-filtered-target-profile-summaries-for-admin';
import findPaginatedFilteredTutorials from './find-paginated-filtered-tutorials';
import findPaginatedFilteredUsers from './find-paginated-filtered-users';
import findPaginatedParticipationsForCampaignManagement from './find-paginated-participations-for-campaign-management';
import findPaginatedTrainingSummaries from './find-paginated-training-summaries';
import findPaginatedUserRecommendedTrainings from './find-paginated-user-recommended-trainings';
import findPendingCertificationCenterInvitations from './find-pending-certification-center-invitations';
import findPendingOrganizationInvitations from './find-pending-organization-invitations';
import findStudentsForEnrollment from './find-students-for-enrollment';
import findTargetProfileStages from './find-target-profile-stages';
import findTargetProfileSummariesForTraining from './find-target-profile-summaries-for-training';
import findTutorials from './find-tutorials';
import findUserAuthenticationMethods from './find-user-authentication-methods';
import findUserCampaignParticipationOverviews from './find-user-campaign-participation-overviews';
import findUserForOidcReconciliation from './find-user-for-oidc-reconciliation';
import findUserOrganizationsForAdmin from './find-user-organizations-for-admin';
import findUserPrivateCertificates from './find-user-private-certificates';
import flagSessionResultsAsSentToPrescriber from './flag-session-results-as-sent-to-prescriber';
import generateUsername from './generate-username';
import generateUsernameWithTemporaryPassword from './generate-username-with-temporary-password';
import getAccountRecoveryDetails from './account-recovery/get-account-recovery-details';
import getAdminMemberDetails from './get-admin-member-details';
import getAdminMembers from './get-admin-members';
import getAnswer from './get-answer';
import getAssessment from './get-assessment';
import getAttendanceSheet from './get-attendance-sheet';
import getAvailableTargetProfilesForOrganization from './get-available-target-profiles-for-organization';
import getCampaign from './get-campaign';
import getCampaignAssessmentParticipation from './get-campaign-assessment-participation';
import getCampaignAssessmentParticipationResult from './get-campaign-assessment-participation-result';
import getCampaignByCode from './get-campaign-by-code';
import getCampaignDetailsManagement from './get-campaign-details-management';
import getCampaignParticipationsActivityByDay from './get-campaign-participations-activity-by-day';
import getCampaignParticipationsCountByStage from './get-campaign-participations-counts-by-stage';
import getCampaignParticipationsCountsByStatus from './get-campaign-participations-counts-by-status';
import getCampaignProfile from './get-campaign-profile';
import getCandidateImportSheetData from './get-candidate-import-sheet-data';
import getCertificationAttestation from './certificate/get-certification-attestation';
import getCertificationCandidate from './get-certification-candidate';
import getCertificationCandidateSubscription from './get-certification-candidate-subscription';
import getCertificationCenter from './get-certification-center';
import getCertificationCenterForAdmin from './get-certification-center-for-admin';
import getCertificationCenterInvitation from './get-certification-center-invitation';
import getCertificationCourse from './get-certification-course';
import getCertificationDetails from './get-certification-details';
import getCertificationPointOfContact from './get-certification-point-of-contact';
import getCertificationsResultsForLS from './certificate/get-certifications-results-for-ls';
import getChallengeForPixAutoAnswer from './get-challenge-for-pix-auto-answer';
import getCleaCertifiedCandidateBySession from './get-clea-certified-candidate-by-session';
import getCorrectionForAnswer from './get-correction-for-answer';
import getCurrentUser from './get-current-user';
import getExternalAuthenticationRedirectionUrl from './get-external-authentication-redirection-url';
import getFrameworkAreas from './get-framework-areas';
import getFrameworks from './get-frameworks';
import getIdentityProviders from './get-identity-providers';
import getImportSessionComplementaryCertificationHabilitationsLabels from './get-import-session-complementary-certification-habilitations-labels';
import getJuryCertification from './get-jury-certification';
import getJurySession from './get-jury-session';
import getLastChallengeIdFromAssessmentId from './get-last-challenge-id-from-assessment-id';
import getLearningContentByTargetProfile from './get-learning-content-by-target-profile';
import getLearningContentForTargetProfileSubmission from './get-learning-content-for-target-profile-submission';
import getNextChallengeForCampaignAssessment from './get-next-challenge-for-campaign-assessment';
import getNextChallengeForCertification from './get-next-challenge-for-certification';
import getNextChallengeForCompetenceEvaluation from './get-next-challenge-for-competence-evaluation';
import getNextChallengeForDemo from './get-next-challenge-for-demo';
import getNextChallengeForPreview from './get-next-challenge-for-preview';
import getOrganizationDetails from './get-organization-details';
import getOrganizationInvitation from './get-organization-invitation';
import getOrganizationLearner from './get-organization-learner';
import getOrganizationLearnerActivity from './get-organization-learner-activity';
import getOrganizationLearnersCsvTemplate from './get-organization-learners-csv-template';
import getOrganizationMemberIdentities from './get-organization-members-identity';
import getOrganizationPlacesCapacity from './get-organization-places-capacity';
import getPaginatedParticipantsForAnOrganization from './get-paginated-participants-for-an-organization';
import getParticipantsDivision from './get-participants-division';
import getParticipantsGroup from './get-participants-group';
import getParticipationsCountByMasteryRate from './get-participations-count-by-mastery-rate';
import getPoleEmploiSendings from './get-pole-emploi-sendings';
import getPrescriber from './get-prescriber';
import getPrivateCertificate from './certificate/get-private-certificate';
import getProgression from './get-progression';
import getRecentlyUsedTags from './get-recently-used-tags';
import getScoCertificationResultsByDivision from './get-sco-certification-results-by-division';
import getScorecard from './get-scorecard';
import getSession from './get-session';
import getSessionCertificationCandidates from './get-session-certification-candidates';
import getSessionCertificationReports from './get-session-certification-reports';
import getSessionForSupervising from './get-session-for-supervising';
import getSessionResults from './get-session-results';
import getSessionResultsByResultRecipientEmail from './get-session-results-by-result-recipient-email';
import getShareableCertificate from './certificate/get-shareable-certificate';
import getSupervisorKitSessionInfo from './get-supervisor-kit-session-info';
import getTargetProfileContentAsJson from './get-target-profile-content-as-json';
import getTargetProfileForAdmin from './get-target-profile-for-admin';
import getTraining from './get-training';
import getUserByResetPasswordDemand from './get-user-by-reset-password-demand';
import getUserCampaignAssessmentResult from './get-user-campaign-assessment-result';
import getUserCampaignParticipationToCampaign from './get-user-campaign-participation-to-campaign';
import getUserCertificationEligibility from './get-user-certification-eligibility';
import getUserDetailsForAdmin from './get-user-details-for-admin';
import getUserProfile from './get-user-profile';
import getUserProfileSharedForCampaign from './get-user-profile-shared-for-campaign';
import handleBadgeAcquisition from './handle-badge-acquisition';
import handleTrainingRecommendation from './handle-training-recommendation';
import importCertificationCandidatesFromCandidatesImportSheet from './import-certification-candidates-from-candidates-import-sheet';
import importOrganizationLearnersFromSIECLEFormat from './import-organization-learners-from-siecle';
import importSupOrganizationLearners from './import-sup-organization-learners';
import improveCompetenceEvaluation from './improve-competence-evaluation';
import linkUserToSessionCertificationCandidate from './link-user-to-session-certification-candidate';
import manuallyResolveCertificationIssueReport from './manually-resolve-certification-issue-report';
import markTargetProfileAsSimplifiedAccess from './mark-target-profile-as-simplified-access';
import neutralizeChallenge from './neutralize-challenge';
import outdateTargetProfile from './outdate-target-profile';
import publishSession from './publish-session';
import publishSessionsInBatch from './publish-sessions-in-batch';
import reassignAuthenticationMethodToAnotherUser from './reassign-authentication-method-to-another-user';
import reconcileOidcUser from './reconcile-oidc-user';
import reconcileScoOrganizationLearnerAutomatically from './reconcile-sco-organization-learner-automatically';
import reconcileScoOrganizationLearnerManually from './reconcile-sco-organization-learner-manually';
import reconcileSupOrganizationLearner from './reconcile-sup-organization-learner';
import rememberUserHasSeenAssessmentInstructions from './remember-user-has-seen-assessment-instructions';
import rememberUserHasSeenChallengeTooltip from './remember-user-has-seen-challenge-tooltip';
import rememberUserHasSeenLastDataProtectionPolicyInformation from './remember-user-has-seen-last-data-protection-policy-information';
import rememberUserHasSeenNewDashboardInfo from './remember-user-has-seen-new-dashboard-info';
import removeAuthenticationMethod from './remove-authentication-method';
import replaceSupOrganizationLearners from './replace-sup-organization-learner';
import resetScorecard from './reset-scorecard';
import retrieveLastOrCreateCertificationCourse from './retrieve-last-or-create-certification-course';
import revokeRefreshToken from './revoke-refresh-token';
import saveAdminMember from './save-admin-member';
import saveCertificationIssueReport from './save-certification-issue-report';
import saveJuryComplementaryCertificationCourseResult from './save-jury-complementary-certification-course-result';
import sendEmailForAccountRecovery from './account-recovery/send-email-for-account-recovery';
import sendScoInvitation from './send-sco-invitation';
import sendSharedParticipationResultsToPoleEmploi from './send-shared-participation-results-to-pole-emploi';
import sendVerificationCode from './send-verification-code';
import shareCampaignResult from './share-campaign-result';
import simulateFlashScoring from './simulate-flash-scoring';
import simulateOldScoring from './simulate-old-scoring';
import startCampaignParticipation from './start-campaign-participation';
import startOrResumeCompetenceEvaluation from './start-or-resume-competence-evaluation';
import startWritingCampaignAssessmentResultsToStream from './start-writing-campaign-assessment-results-to-stream';
import startWritingCampaignProfilesCollectionResultsToStream from './start-writing-campaign-profiles-collection-results-to-stream';
import superviseSession from './supervise-session';
import unarchiveCampaign from './unarchive-campaign';
import unblockUserAccount from './unblock-user-account';
import uncancelCertificationCourse from './uncancel-certification-course';
import unpublishSession from './unpublish-session';
import updateAdminMember from './update-admin-member';
import updateBadge from './update-badge';
import updateCampaign from './update-campaign';
import updateCampaignDetailsManagement from './update-campaign-details-management';
import updateCertificationCenter from './update-certification-center';
import updateCertificationCenterReferer from './update-certification-center-referer';
import updateExpiredPassword from './update-expired-password';
import updateLastQuestionState from './update-last-question-state';
import updateMembership from './update-membership';
import updateOrganizationInformation from './update-organization-information';
import updateOrganizationLearnerDependentUserPassword from './update-organization-learner-dependent-user-password';
import updateParticipantExternalId from './update-participant-external-id';
import updateSession from './update-session';
import updateStage from './update-stage';
import updateStudentNumber from './update-student-number';
import updateTargetProfile from './update-target-profile';
import updateTraining from './update-training';
import updateUserDetailsForAdministration from './update-user-details-for-administration';
import updateUserEmailWithValidation from './update-user-email-with-validation';
import updateUserForAccountRecovery from './account-recovery/update-user-for-account-recovery';
import updateUserPassword from './update-user-password';

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

export default injectDependencies(usecases, dependencies);
