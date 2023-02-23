const buildAccountRecoveryDemand = require('./build-account-recovery-demand');
const buildAnswer = require('./build-answer');
const buildAnsweredNotCompletedCertificationAssessment = require('./build-answered-not-completed-certification-assessment');
const buildAssessment = require('./build-assessment');
const buildAssessmentFromParticipation = require('./build-assessment-from-participation');
const buildAssessmentResult = require('./build-assessment-result');
const buildAuthenticationMethod = require('./build-authentication-method');
const buildBadge = require('./build-badge');
const buildBadgeAcquisition = require('./build-badge-acquisition');
const buildBadgeCriterion = require('./build-badge-criterion');
const buildSkillSet = require('./build-skill-set');
const buildCampaign = require('./build-campaign');
const buildCampaignSkill = require('./build-campaign-skill');
const buildAssessmentCampaign = require('./build-assessment-campaign');
const buildAssessmentCampaignForSkills = require('./build-assessment-campaign-for-skills');
const buildCampaignParticipation = require('./build-campaign-participation');
const buildCampaignParticipationElementsForOverview = require('./build-campaign-participation-elements-for-overview');
const buildCampaignParticipationWithOrganizationLearner = require('./build-campaign-participation-with-organization-learner');
const buildCampaignParticipationWithUser = require('./build-campaign-participation-with-user');
const buildCertifiableUser = require('./build-certifiable-user');
const buildCertificationCandidate = require('./build-certification-candidate');
const buildCertificationCenter = require('./build-certification-center');
const buildCertificationCenterInvitation = require('./build-certification-center-invitation');
const buildCertificationCenterMembership = require('./build-certification-center-membership');
const buildCertificationChallenge = require('./build-certification-challenge');
const buildComplementaryCertificationCourseResult = require('./build-complementary-certification-course-result');
const buildCertificationCourse = require('./build-certification-course');
const buildCertificationCourseLastAssessmentResult = require('./build-certification-course-last-assessment-result');
const buildCertificationCpfCity = require('./build-certification-cpf-city');
const buildCertificationIssueReport = require('./build-certification-issue-report');
const buildCertificationReport = require('./build-certification-report');
const buildCertificationCpfCountry = require('./build-certification-cpf-country');
const buildCompetenceEvaluation = require('./build-competence-evaluation');
const buildCompetenceMark = require('./build-competence-mark');
const buildComplementaryCertification = require('./build-complementary-certification');
const buildComplementaryCertificationCourse = require('./build-complementary-certification-course');
const buildComplementaryCertificationBadge = require('./build-complementary-certification-badge');
const buildComplementaryCertificationHabilitation = require('./build-complementary-certification-habilitation');
const buildComplementaryCertificationSubscription = require('./build-complementary-certification-subscription');
const buildCorrectAnswersAndKnowledgeElementsForLearningContent = require('./build-correct-answers-and-knowledge-elements-for-learning-content');
const buildCorrectAnswerAndKnowledgeElement = require('./build-correct-answer-and-knowledge-element');
const buildDataProtectionOfficer = require('./build-data-protection-officer');
const buildFinalizedSession = require('./build-finalized-session');
const buildFlashAssessmentResult = require('./build-flash-assessment-result');
const buildIssueReportCategory = require('./build-issue-report-category');
const buildKnowledgeElement = require('./build-knowledge-element');
const buildKnowledgeElementSnapshot = require('./build-knowledge-element-snapshot');
const buildMembership = require('./build-membership');
const buildOrganization = require('./build-organization');
const buildOrganizationPlace = require('./build-organization-place');
const buildOrganizationInvitation = require('./build-organization-invitation');
const buildOrganizationLearner = require('./build-organization-learner');
const buildOrganizationLearnerWithUser = require('./build-organization-learner-with-user');
const buildOrganizationTag = require('./build-organization-tag');
const buildPixAdminRole = require('./build-pix-admin-role');
const buildResetPasswordDemand = require('./build-reset-password-demand');
const buildSession = require('./build-session');
const buildStage = require('./build-stage');
const buildSupervisorAccess = require('./build-supervisor-access');
const buildTag = require('./build-tag');
const buildTargetProfile = require('./build-target-profile');
const buildTargetProfileSkill = require('./build-target-profile-skill');
const buildTargetProfileShare = require('./build-target-profile-share');
const buildTargetProfileTraining = require('./build-target-profile-training');
const buildTargetProfileTube = require('./build-target-profile-tube');
const buildTraining = require('./build-training');
const buildTrainingTrigger = require('./build-training-trigger');
const buildTrainingTriggerTube = require('./build-training-trigger-tube');
const buildTutorialEvaluation = require('./build-tutorial-evaluation');
const buildUser = require('./build-user');
const buildUserLogin = require('./build-user-login');
const buildUserOrgaSettings = require('./build-user-orga-settings');
const buildUserSavedTutorial = require('./build-user-saved-tutorial');
const buildUserRecommendedTraining = require('./build-user-recommended-training');
const campaignParticipationOverviewFactory = require('./campaign-participation-overview-factory');
const knowledgeElementSnapshotFactory = require('./knowledge-elements-snapshot-factory');
const poleEmploiSendingFactory = require('./pole-emploi-sending-factory');

module.exports = {
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
