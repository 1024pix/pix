const buildAccountRecoveryDemand = require('./build-account-recovery-demand');
const buildAdminMember = require('./build-admin-member');
const buildAllowedCertificationCenterAccess = require('./build-allowed-certification-center-access');
const buildAnswer = require('./build-answer');
const buildArea = require('./build-area');
const buildAssessment = require('./build-assessment');
const buildAssessmentResult = require('./build-assessment-result');
const buildAuthenticationMethod = require('./build-authentication-method');
const buildBadge = require('./build-badge');
const buildBadgeAcquisition = require('./build-badge-acquisition');
const buildBadgeCriterion = require('./build-badge-criterion');
const buildBadgeDetails = require('./build-badge-details');
const buildBadgeForCalculation = require('./build-badge-for-calculation');
const buildBadgeCriterionForCalculation = require('./build-badge-criterion-for-calculation');
const buildSkillSet = require('./build-skill-set');
const buildCampaign = require('./build-campaign');
const buildCampaignCollectiveResult = require('./build-campaign-collective-result');
const buildCampaignParticipation = require('./build-campaign-participation');
const buildCampaignParticipationBadge = require('./build-campaign-participation-badge');
const buildCampaignParticipationForUserManagement = require('./build-campaign-participation-for-user-management');
const buildCampaignParticipationResult = require('./build-campaign-participation-result');
const buildCampaignParticipationInfo = require('./build-campaign-participation-info');
const buildCampaignStages = require('./build-campaign-stages');
const buildCampaignLearningContent = require('./build-campaign-learning-content');
const buildCampaignManagement = require('./build-campaign-management');
const buildCampaignReport = require('./build-campaign-report');
const buildCampaignToJoin = require('./build-campaign-to-join');
const buildCampaignToStartParticipation = require('./build-campaign-to-start-participation');
const buildCertifiableBadgeAcquisition = require('./build-certifiable-badge-acquisition');
const buildCertificationAssessment = require('./build-certification-assessment');
const buildCertificationAssessmentScore = require('./build-certification-assessment-score');
const buildCertificationCandidate = require('./build-certification-candidate');
const buildCertificationCandidateForSupervising = require('./build-certification-candidate-for-supervising');
const buildCertificationCandidateSubscription = require('./build-certification-candidate-subscription');
const buildCertificationEligibility = require('./build-certification-eligibility');
const buildCertificationIssueReport = require('./build-certification-issue-report');
const buildCertificationOfficer = require('./build-certification-officer');
const buildSCOCertificationCandidate = require('./build-sco-certification-candidate');
const buildCertificationAttestation = require('./build-certification-attestation');
const buildCertificationCenter = require('./build-certification-center');
const buildCertificationCenterForAdmin = require('./build-certification-center-for-admin');
const buildCertificationCenterInvitation = require('./build-certification-center-invitation');
const buildCertificationCenterMembership = require('./build-certification-center-membership');
const buildCertificationChallenge = require('./build-certification-challenge');
const buildCertificationChallengeWithType = require('./build-certification-challenge-with-type');
const buildCertificationCourse = require('./build-certification-course');
const buildCertificationCpfCity = require('./build-certification-cpf-city');
const buildCertificationCpfCountry = require('./build-certification-cpf-country');
const buildCertificationDetails = require('./build-certification-details');
const buildCertificationPointOfContact = require('./build-certification-point-of-contact');
const buildCertifiableProfileForLearningContent = require('./build-certifiable-profile-for-learning-content');
const buildCertificationReport = require('./build-certification-report');
const buildCertificationResult = require('./build-certification-result');
const buildCertificationRescoringCompletedEvent = require('./build-certification-rescoring-completed-event');
const buildCertificationScoringCompletedEvent = require('./build-certification-scoring-completed-event');
const buildCertifiedArea = require('./build-certified-area');
const buildCertifiedCompetence = require('./build-certified-competence');
const buildCertifiedProfile = require('./build-certified-profile');
const buildCertifiedSkill = require('./build-certified-skill');
const buildCertifiedTube = require('./build-certified-tube');
const buildChallenge = require('./build-challenge');
const buildChallengeLearningContentDataObject = require('./build-challenge-learning-content-data-object');
const buildCleaCertifiedCandidate = require('./build-clea-certified-candidate');
const buildCompetence = require('./build-competence');
const buildCompetenceEvaluation = require('./build-competence-evaluation');
const buildCompetenceMark = require('./build-competence-mark');
const buildCompetenceResult = require('./build-competence-result');
const buildCompetenceTree = require('./build-competence-tree');
const buildComplementaryCertification = require('./build-complementary-certification');
const buildComplementaryCertificationHabilitation = require('./build-complementary-certification-habilitation');
const buildComplementaryCertificationScoringCriteria = require('./build-complementary-certification-scoring-criteria');
const buildCountry = require('./build-country');
const buildCourse = require('./build-course');
const buildCpfCertificationResult = require('./build-cpf-certification-result');
const buildDataProtectionOfficer = require('./build-data-protection-officer');
const buildFinalizedSession = require('./build-finalized-session');
const buildFramework = require('./build-framework');
const buildHint = require('./build-hint');
const buildSupOrganizationLearner = require('./build-sup-organization-learner');
const buildJuryCertification = require('./build-jury-certification');
const buildJuryCertificationSummary = require('./build-jury-certification-summary');
const buildJurySession = require('./build-jury-session');
const buildKnowledgeElement = require('./build-knowledge-element');
const buildLearningContent = require('./build-learning-content');
const buildMembership = require('./build-membership');
const buildOrganization = require('./build-organization');
const buildOrganizationPlacesLot = require('./build-organization-places-lot');
const buildOrganizationPlacesLotManagement = require('./build-organization-places-lot-management');
const buildOrganizationForAdmin = require('./build-organization-for-admin');
const buildOrganizationInvitation = require('./build-organization-invitation');
const buildOrganizationLearner = require('./build-organization-learner');
const buildOrganizationLearnerForAdmin = require('./build-organization-learner-for-admin');
const buildOrganizationLearnerParticipation = require('./build-organization-learner-participation');
const buildOrganizationTag = require('./build-organization-tag');
const buildParticipationForCampaignManagement = require('./build-participation-for-campaign-management');
const buildComplementaryCertificationCourseResult = require('./build-complementary-certification-course-result');
const buildComplementaryCertificationCourseResultForJuryCertification = require('./build-complementary-certification-course-result-for-certification');
const buildComplementaryCertificationCourseResultForJuryCertificationWithExternal = require('./build-complementary-certification-course-result-for-certification-with-external');
const buildComplementaryCertificationScoringWithoutComplementaryReferential = require('./build-complementary-certification-scoring-without-complementary-referential');
const buildComplementaryCertificationScoringWithComplementaryReferential = require('./build-pix-plus-certification-scoring');
const buildPlacementProfile = require('./build-placement-profile');
const buildPoleEmploiSending = require('./build-pole-emploi-sending');
const buildPrescriber = require('./build-prescriber');
const buildPrivateCertificate = require('./build-private-certificate');
const buildPrivateCertificateWithCompetenceTree = require('./build-private-certificate-with-competence-tree');
const buildProgression = require('./build-progression');
const buildReproducibilityRate = require('./build-reproducibility-rate');
const buildResultCompetenceTree = require('./build-result-competence-tree');
const buildSession = require('./build-session');
const buildSessionForSupervising = require('./build-session-for-supervising');
const buildSessionForSupervisorKit = require('./build-session-for-supervisor-kit');
const buildSessionJuryComment = require('./build-session-jury-comment');
const buildSessionSummary = require('./build-session-summary');
const buildShareableCertificate = require('./build-shareable-certificate');
const buildSkill = require('./build-skill');
const buildSkillLearningContentDataObject = require('./build-skill-learning-content-data-object');
const buildSkillCollection = require('./build-skill-collection');
const buildSolution = require('./build-solution');
const buildStage = require('./build-stage');
const buildStageCollectionForTargetProfileManagement = require('./target-profile-management/build-stage-collection');
const buildTag = require('./build-tag');
const buildTargetProfile = require('./build-target-profile');
const buildTargetProfileForAdmin = require('./build-target-profile-for-admin');
const buildTargetProfileForCreation = require('./build-target-profile-for-creation');
const buildOrganizationsToAttachToTargetProfile = require('./build-organizations-to-attach-to-target-profile');
const buildTargetProfileSummaryForAdmin = require('./build-target-profile-summary-for-admin');
const buildThematic = require('./build-thematic');
const buildTraining = require('./build-training');
const buildTrainingSummary = require('./build-training-summary');
const buildTrainingTrigger = require('./build-training-trigger');
const buildTrainingTriggerTube = require('./build-training-trigger-tube');
const buildTube = require('./build-tube');
const buildTutorial = require('./build-tutorial');
const buildTutorialForUser = require('./build-tutorial-for-user');
const buildUser = require('./build-user');
const buildUserCompetence = require('./build-user-competence');
const buildUserDetailsForAdmin = require('./build-user-details-for-admin');
const buildUserOrgaSettings = require('./build-user-orga-settings');
const buildUserScorecard = require('./build-user-scorecard');
const buildUserSavedTutorial = require('./build-user-saved-tutorial');
const buildUserSavedTutorialWithTutorial = require('./build-user-saved-tutorial-with-tutorial');
const buildValidation = require('./build-validation');
const buildValidator = require('./build-validator');

module.exports = {
  buildAccountRecoveryDemand,
  buildAdminMember,
  buildAllowedCertificationCenterAccess,
  buildAnswer,
  buildArea,
  buildAssessment,
  buildAssessmentResult,
  buildAuthenticationMethod,
  buildBadge,
  buildBadgeAcquisition,
  buildBadgeCriterion,
  buildBadgeDetails,
  buildBadgeForCalculation,
  buildBadgeCriterionForCalculation,
  buildSkillSet,
  buildCampaign,
  buildCampaignCollectiveResult,
  buildCampaignParticipation,
  buildCampaignParticipationBadge,
  buildCampaignParticipationForUserManagement,
  buildCampaignParticipationResult,
  buildCampaignParticipationInfo,
  buildCampaignStages,
  buildCampaignLearningContent,
  buildCampaignManagement,
  buildCampaignReport,
  buildCampaignToJoin,
  buildCampaignToStartParticipation,
  buildCertifiableBadgeAcquisition,
  buildCertificationAssessment,
  buildCertificationAssessmentScore,
  buildCertificationCandidate,
  buildCertificationCandidateForSupervising,
  buildCertificationCandidateSubscription,
  buildCertificationEligibility,
  buildCertificationIssueReport,
  buildCertificationOfficer,
  buildSCOCertificationCandidate,
  buildCertificationAttestation,
  buildCertificationCenter,
  buildCertificationCenterForAdmin,
  buildCertificationCenterInvitation,
  buildCertificationCenterMembership,
  buildCertificationChallenge,
  buildCertificationChallengeWithType,
  buildCertificationCourse,
  buildCertificationCpfCity,
  buildCertificationCpfCountry,
  buildCertificationDetails,
  buildCertificationPointOfContact,
  buildCertifiableProfileForLearningContent,
  buildCertificationReport,
  buildCertificationResult,
  buildCertificationRescoringCompletedEvent,
  buildCertificationScoringCompletedEvent,
  buildCertifiedArea,
  buildCertifiedCompetence,
  buildCertifiedProfile,
  buildCertifiedSkill,
  buildCertifiedTube,
  buildChallenge,
  buildChallengeLearningContentDataObject,
  buildCleaCertifiedCandidate,
  buildCompetence,
  buildCompetenceEvaluation,
  buildCompetenceMark,
  buildCompetenceResult,
  buildCompetenceTree,
  buildComplementaryCertification,
  buildComplementaryCertificationHabilitation,
  buildComplementaryCertificationScoringCriteria,
  buildCountry,
  buildCourse,
  buildCpfCertificationResult,
  buildDataProtectionOfficer,
  buildFinalizedSession,
  buildFramework,
  buildHint,
  buildSupOrganizationLearner,
  buildJuryCertification,
  buildJuryCertificationSummary,
  buildJurySession,
  buildKnowledgeElement,
  buildLearningContent,
  buildMembership,
  buildOrganization,
  buildOrganizationPlacesLot,
  buildOrganizationPlacesLotManagement,
  buildOrganizationForAdmin,
  buildOrganizationInvitation,
  buildOrganizationLearner,
  buildOrganizationLearnerForAdmin,
  buildOrganizationLearnerParticipation,
  buildOrganizationTag,
  buildParticipationForCampaignManagement,
  buildComplementaryCertificationCourseResult,
  buildComplementaryCertificationCourseResultForJuryCertification,
  buildComplementaryCertificationCourseResultForJuryCertificationWithExternal,
  buildComplementaryCertificationScoringWithoutComplementaryReferential,
  buildComplementaryCertificationScoringWithComplementaryReferential,
  buildPlacementProfile,
  buildPoleEmploiSending,
  buildPrescriber,
  buildPrivateCertificate,
  buildPrivateCertificateWithCompetenceTree,
  buildProgression,
  buildReproducibilityRate,
  buildResultCompetenceTree,
  buildSession,
  buildSessionForSupervising,
  buildSessionForSupervisorKit,
  buildSessionJuryComment,
  buildSessionSummary,
  buildShareableCertificate,
  buildSkill,
  buildSkillLearningContentDataObject,
  buildSkillCollection,
  buildSolution,
  buildStage,
  buildStageCollectionForTargetProfileManagement,
  buildTag,
  buildTargetProfile,
  buildTargetProfileForAdmin,
  buildTargetProfileForCreation,
  buildOrganizationsToAttachToTargetProfile,
  buildTargetProfileSummaryForAdmin,
  buildThematic,
  buildTraining,
  buildTrainingSummary,
  buildTrainingTrigger,
  buildTrainingTriggerTube,
  buildTube,
  buildTutorial,
  buildTutorialForUser,
  buildUser,
  buildUserCompetence,
  buildUserDetailsForAdmin,
  buildUserOrgaSettings,
  buildUserScorecard,
  buildUserSavedTutorial,
  buildUserSavedTutorialWithTutorial,
  buildValidation,
  buildValidator,
};
