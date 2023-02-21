import buildAccountRecoveryDemand from './build-account-recovery-demand';
import buildAdminMember from './build-admin-member';
import buildAllowedCertificationCenterAccess from './build-allowed-certification-center-access';
import buildAnswer from './build-answer';
import buildArea from './build-area';
import buildAssessment from './build-assessment';
import buildAssessmentResult from './build-assessment-result';
import buildAuthenticationMethod from './build-authentication-method';
import buildBadge from './build-badge';
import buildBadgeAcquisition from './build-badge-acquisition';
import buildBadgeCriterion from './build-badge-criterion';
import buildBadgeDetails from './build-badge-details';
import buildBadgeForCalculation from './build-badge-for-calculation';
import buildBadgeCriterionForCalculation from './build-badge-criterion-for-calculation';
import buildSkillSet from './build-skill-set';
import buildCampaign from './build-campaign';
import buildCampaignCollectiveResult from './build-campaign-collective-result';
import buildCampaignParticipation from './build-campaign-participation';
import buildCampaignParticipationBadge from './build-campaign-participation-badge';
import buildCampaignParticipationForUserManagement from './build-campaign-participation-for-user-management';
import buildCampaignParticipationResult from './build-campaign-participation-result';
import buildCampaignParticipationInfo from './build-campaign-participation-info';
import buildCampaignStages from './build-campaign-stages';
import buildCampaignLearningContent from './build-campaign-learning-content';
import buildCampaignManagement from './build-campaign-management';
import buildCampaignReport from './build-campaign-report';
import buildCampaignToJoin from './build-campaign-to-join';
import buildCampaignToStartParticipation from './build-campaign-to-start-participation';
import buildCertifiableBadgeAcquisition from './build-certifiable-badge-acquisition';
import buildCertificationAssessment from './build-certification-assessment';
import buildCertificationAssessmentScore from './build-certification-assessment-score';
import buildCertificationCandidate from './build-certification-candidate';
import buildCertificationCandidateForSupervising from './build-certification-candidate-for-supervising';
import buildCertificationCandidateSubscription from './build-certification-candidate-subscription';
import buildCertificationEligibility from './build-certification-eligibility';
import buildCertificationIssueReport from './build-certification-issue-report';
import buildCertificationOfficer from './build-certification-officer';
import buildSCOCertificationCandidate from './build-sco-certification-candidate';
import buildCertificationAttestation from './build-certification-attestation';
import buildCertificationCenter from './build-certification-center';
import buildCertificationCenterForAdmin from './build-certification-center-for-admin';
import buildCertificationCenterInvitation from './build-certification-center-invitation';
import buildCertificationCenterMembership from './build-certification-center-membership';
import buildCertificationChallenge from './build-certification-challenge';
import buildCertificationChallengeWithType from './build-certification-challenge-with-type';
import buildCertificationCourse from './build-certification-course';
import buildCertificationCpfCity from './build-certification-cpf-city';
import buildCertificationCpfCountry from './build-certification-cpf-country';
import buildCertificationDetails from './build-certification-details';
import buildCertificationPointOfContact from './build-certification-point-of-contact';
import buildCertifiableProfileForLearningContent from './build-certifiable-profile-for-learning-content';
import buildCertificationReport from './build-certification-report';
import buildCertificationResult from './build-certification-result';
import buildCertificationRescoringCompletedEvent from './build-certification-rescoring-completed-event';
import buildCertificationScoringCompletedEvent from './build-certification-scoring-completed-event';
import buildCertifiedArea from './build-certified-area';
import buildCertifiedCompetence from './build-certified-competence';
import buildCertifiedProfile from './build-certified-profile';
import buildCertifiedSkill from './build-certified-skill';
import buildCertifiedTube from './build-certified-tube';
import buildChallenge from './build-challenge';
import buildChallengeLearningContentDataObject from './build-challenge-learning-content-data-object';
import buildCleaCertifiedCandidate from './build-clea-certified-candidate';
import buildCompetence from './build-competence';
import buildCompetenceEvaluation from './build-competence-evaluation';
import buildCompetenceMark from './build-competence-mark';
import buildCompetenceResult from './build-competence-result';
import buildCompetenceTree from './build-competence-tree';
import buildComplementaryCertification from './build-complementary-certification';
import buildComplementaryCertificationHabilitation from './build-complementary-certification-habilitation';
import buildComplementaryCertificationScoringCriteria from './build-complementary-certification-scoring-criteria';
import buildCountry from './build-country';
import buildCourse from './build-course';
import buildCpfCertificationResult from './build-cpf-certification-result';
import buildDataProtectionOfficer from './build-data-protection-officer';
import buildFinalizedSession from './build-finalized-session';
import buildFramework from './build-framework';
import buildHint from './build-hint';
import buildSupOrganizationLearner from './build-sup-organization-learner';
import buildJuryCertification from './build-jury-certification';
import buildJuryCertificationSummary from './build-jury-certification-summary';
import buildJurySession from './build-jury-session';
import buildKnowledgeElement from './build-knowledge-element';
import buildLearningContent from './build-learning-content';
import buildMembership from './build-membership';
import buildOrganization from './build-organization';
import buildOrganizationPlacesLot from './build-organization-places-lot';
import buildOrganizationPlacesLotManagement from './build-organization-places-lot-management';
import buildOrganizationForAdmin from './build-organization-for-admin';
import buildOrganizationInvitation from './build-organization-invitation';
import buildOrganizationLearner from './build-organization-learner';
import buildOrganizationLearnerForAdmin from './build-organization-learner-for-admin';
import buildOrganizationLearnerParticipation from './build-organization-learner-participation';
import buildOrganizationTag from './build-organization-tag';
import buildParticipationForCampaignManagement from './build-participation-for-campaign-management';
import buildComplementaryCertificationCourseResult from './build-complementary-certification-course-result';
import buildComplementaryCertificationCourseResultForJuryCertification from './build-complementary-certification-course-result-for-certification';
import buildComplementaryCertificationCourseResultForJuryCertificationWithExternal from './build-complementary-certification-course-result-for-certification-with-external';
import buildComplementaryCertificationScoringWithoutComplementaryReferential from './build-complementary-certification-scoring-without-complementary-referential';
import buildComplementaryCertificationScoringWithComplementaryReferential from './build-pix-plus-certification-scoring';
import buildPlacementProfile from './build-placement-profile';
import buildPoleEmploiSending from './build-pole-emploi-sending';
import buildPrescriber from './build-prescriber';
import buildPrivateCertificate from './build-private-certificate';
import buildPrivateCertificateWithCompetenceTree from './build-private-certificate-with-competence-tree';
import buildProgression from './build-progression';
import buildReproducibilityRate from './build-reproducibility-rate';
import buildResultCompetenceTree from './build-result-competence-tree';
import buildSession from './build-session';
import buildSessionForSupervising from './build-session-for-supervising';
import buildSessionForSupervisorKit from './build-session-for-supervisor-kit';
import buildSessionJuryComment from './build-session-jury-comment';
import buildSessionSummary from './build-session-summary';
import buildShareableCertificate from './build-shareable-certificate';
import buildSkill from './build-skill';
import buildSkillLearningContentDataObject from './build-skill-learning-content-data-object';
import buildSkillCollection from './build-skill-collection';
import buildSolution from './build-solution';
import buildStage from './build-stage';
import buildStageCollection from './target-profile-management/build-stage-collection';
import buildTag from './build-tag';
import buildTargetProfile from './build-target-profile';
import buildTargetProfileForAdmin from './build-target-profile-for-admin';
import buildTargetProfileForCreation from './build-target-profile-for-creation';
import buildOrganizationsToAttachToTargetProfile from './build-organizations-to-attach-to-target-profile';
import buildTargetProfileSummaryForAdmin from './build-target-profile-summary-for-admin';
import buildThematic from './build-thematic';
import buildTraining from './build-training';
import buildTrainingSummary from './build-training-summary';
import buildTrainingTrigger from './build-training-trigger';
import buildTube from './build-tube';
import buildTutorial from './build-tutorial';
import buildTutorialForUser from './build-tutorial-for-user';
import buildUser from './build-user';
import buildUserCompetence from './build-user-competence';
import buildUserDetailsForAdmin from './build-user-details-for-admin';
import buildUserOrgaSettings from './build-user-orga-settings';
import buildUserScorecard from './build-user-scorecard';
import buildUserSavedTutorial from './build-user-saved-tutorial';
import buildUserSavedTutorialWithTutorial from './build-user-saved-tutorial-with-tutorial';
import buildValidation from './build-validation';
import buildValidator from './build-validator';

export default {
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
  buildStageCollection,
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
