import buildAccountRecoveryDemand from './build-account-recovery-demand';
import buildAnswer from './build-answer';
import buildAnsweredNotCompletedCertificationAssessment from './build-answered-not-completed-certification-assessment';
import buildAssessment from './build-assessment';
import buildAssessmentFromParticipation from './build-assessment-from-participation';
import buildAssessmentResult from './build-assessment-result';
import buildAuthenticationMethod from './build-authentication-method';
import buildBadge from './build-badge';
import buildBadgeAcquisition from './build-badge-acquisition';
import buildBadgeCriterion from './build-badge-criterion';
import buildSkillSet from './build-skill-set';
import buildCampaign from './build-campaign';
import buildCampaignSkill from './build-campaign-skill';
import buildAssessmentCampaign from './build-assessment-campaign';
import buildAssessmentCampaignForSkills from './build-assessment-campaign-for-skills';
import buildCampaignParticipation from './build-campaign-participation';
import buildCampaignParticipationElementsForOverview from './build-campaign-participation-elements-for-overview';
import buildCampaignParticipationWithOrganizationLearner from './build-campaign-participation-with-organization-learner';
import buildCampaignParticipationWithUser from './build-campaign-participation-with-user';
import buildCertifiableUser from './build-certifiable-user';
import buildCertificationCandidate from './build-certification-candidate';
import buildCertificationCenter from './build-certification-center';
import buildCertificationCenterInvitation from './build-certification-center-invitation';
import buildCertificationCenterMembership from './build-certification-center-membership';
import buildCertificationChallenge from './build-certification-challenge';
import buildComplementaryCertificationCourseResult from './build-complementary-certification-course-result';
import buildCertificationCourse from './build-certification-course';
import buildCertificationCourseLastAssessmentResult from './build-certification-course-last-assessment-result';
import buildCertificationCpfCity from './build-certification-cpf-city';
import buildCertificationIssueReport from './build-certification-issue-report';
import buildCertificationReport from './build-certification-report';
import buildCertificationCpfCountry from './build-certification-cpf-country';
import buildCompetenceEvaluation from './build-competence-evaluation';
import buildCompetenceMark from './build-competence-mark';
import buildComplementaryCertification from './build-complementary-certification';
import buildComplementaryCertificationCourse from './build-complementary-certification-course';
import buildComplementaryCertificationBadge from './build-complementary-certification-badge';
import buildComplementaryCertificationHabilitation from './build-complementary-certification-habilitation';
import buildComplementaryCertificationSubscription from './build-complementary-certification-subscription';
import buildCorrectAnswersAndKnowledgeElementsForLearningContent from './build-correct-answers-and-knowledge-elements-for-learning-content';
import buildCorrectAnswerAndKnowledgeElement from './build-correct-answer-and-knowledge-element';
import buildDataProtectionOfficer from './build-data-protection-officer';
import buildFinalizedSession from './build-finalized-session';
import buildFlashAssessmentResult from './build-flash-assessment-result';
import buildIssueReportCategory from './build-issue-report-category';
import buildKnowledgeElement from './build-knowledge-element';
import buildKnowledgeElementSnapshot from './build-knowledge-element-snapshot';
import buildMembership from './build-membership';
import buildOrganization from './build-organization';
import buildOrganizationPlace from './build-organization-place';
import buildOrganizationInvitation from './build-organization-invitation';
import buildOrganizationLearner from './build-organization-learner';
import buildOrganizationLearnerWithUser from './build-organization-learner-with-user';
import buildOrganizationTag from './build-organization-tag';
import buildPixAdminRole from './build-pix-admin-role';
import buildResetPasswordDemand from './build-reset-password-demand';
import buildSession from './build-session';
import buildStage from './build-stage';
import buildSupervisorAccess from './build-supervisor-access';
import buildTag from './build-tag';
import buildTargetProfile from './build-target-profile';
import buildTargetProfileSkill from './build-target-profile-skill';
import buildTargetProfileShare from './build-target-profile-share';
import buildTargetProfileTraining from './build-target-profile-training';
import buildTargetProfileTube from './build-target-profile-tube';
import buildTraining from './build-training';
import buildTrainingTrigger from './build-training-trigger';
import buildTrainingTriggerTube from './build-training-trigger-tube';
import buildTutorialEvaluation from './build-tutorial-evaluation';
import buildUser from './build-user';
import buildUserLogin from './build-user-login';
import buildUserOrgaSettings from './build-user-orga-settings';
import buildUserSavedTutorial from './build-user-saved-tutorial';
import buildUserRecommendedTraining from './build-user-recommended-training';
import campaignParticipationOverviewFactory from './campaign-participation-overview-factory';
import knowledgeElementSnapshotFactory from './knowledge-elements-snapshot-factory';
import poleEmploiSendingFactory from './pole-emploi-sending-factory';

export default {
  buildAccountRecoveryDemand,
  buildAnswer,
  buildAnsweredNotCompletedCertificationAssessment,
  buildAssessment,
  buildAssessmentFromParticipation,
  buildAssessmentResult,
  buildAuthenticationMethod,
  buildBadge,
  buildBadgeAcquisition,
  buildBadgeCriterion,
  buildSkillSet,
  buildCampaign,
  buildCampaignSkill,
  buildAssessmentCampaign,
  buildAssessmentCampaignForSkills,
  buildCampaignParticipation,
  buildCampaignParticipationElementsForOverview,
  buildCampaignParticipationWithOrganizationLearner,
  buildCampaignParticipationWithUser,
  buildCertifiableUser,
  buildCertificationCandidate,
  buildCertificationCenter,
  buildCertificationCenterInvitation,
  buildCertificationCenterMembership,
  buildCertificationChallenge,
  buildComplementaryCertificationCourseResult,
  buildCertificationCourse,
  buildCertificationCourseLastAssessmentResult,
  buildCertificationCpfCity,
  buildCertificationIssueReport,
  buildCertificationReport,
  buildCertificationCpfCountry,
  buildCompetenceEvaluation,
  buildCompetenceMark,
  buildComplementaryCertification,
  buildComplementaryCertificationCourse,
  buildComplementaryCertificationBadge,
  buildComplementaryCertificationHabilitation,
  buildComplementaryCertificationSubscription,
  buildCorrectAnswersAndKnowledgeElementsForLearningContent,
  buildCorrectAnswerAndKnowledgeElement,
  buildDataProtectionOfficer,
  buildFinalizedSession,
  buildFlashAssessmentResult,
  buildIssueReportCategory,
  buildKnowledgeElement,
  buildKnowledgeElementSnapshot,
  buildMembership,
  buildOrganization,
  buildOrganizationPlace,
  buildOrganizationInvitation,
  buildOrganizationLearner,
  buildOrganizationLearnerWithUser,
  buildOrganizationTag,
  buildPixAdminRole,
  buildResetPasswordDemand,
  buildSession,
  buildStage,
  buildSupervisorAccess,
  buildTag,
  buildTargetProfile,
  buildTargetProfileSkill,
  buildTargetProfileShare,
  buildTargetProfileTraining,
  buildTargetProfileTube,
  buildTraining,
  buildTrainingTrigger,
  buildTrainingTriggerTube,
  buildTutorialEvaluation,
  buildUser,
  buildUserLogin,
  buildUserOrgaSettings,
  buildUserSavedTutorial,
  buildUserRecommendedTraining,
  campaignParticipationOverviewFactory,
  knowledgeElementSnapshotFactory,
  poleEmploiSendingFactory,
};
