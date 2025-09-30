import { buildCertificate } from '../factory/certification/results/build-v3-certification-attestation.js';
import { buildPassage } from '../factory/devcomp/build-passage.js';
import { buildEmptyInformationBanner, buildInformationBanner } from './banner/build-banner-information.js';
import { buildAccountRecoveryDemand } from './build-account-recovery-demand.js';
import { buildActivity } from './build-activity.js';
import { buildActivityAnswer } from './build-activity-answer.js';
import { buildAdminMember } from './build-admin-member.js';
import { buildAdministrationTeam } from './build-administration-team.js';
import { buildAllowedCertificationCenterAccess } from './build-allowed-certification-center-access.js';
import { buildAnswer } from './build-answer.js';
import { buildArea } from './build-area.js';
import { buildAssessment } from './build-assessment.js';
import { buildAssessmentResult } from './build-assessment-result.js';
import { buildAttestationUserDetail } from './build-attestation-user-detail.js';
import { buildAuthenticationMethod } from './build-authentication-method.js';
import { buildBadge } from './build-badge.js';
import { buildBadgeCriterion } from './build-badge-criterion.js';
import { buildBadgeCriterionForCalculation } from './build-badge-criterion-for-calculation.js';
import { buildBadgeDetails } from './build-badge-details.js';
import { buildBadgeForCalculation } from './build-badge-for-calculation.js';
import { buildBadgeToAttach } from './build-badge-to-attach.js';
import { buildCampaign } from './build-campaign.js';
import { buildCampaignCollectiveResult } from './build-campaign-collective-result.js';
import { buildCampaignLearningContent } from './build-campaign-learning-content.js';
import { buildCampaignManagement } from './build-campaign-management.js';
import { buildCampaignParticipation } from './build-campaign-participation.js';
import { buildCampaignParticipationForUserManagement } from './build-campaign-participation-for-user-management.js';
import { buildCampaignParticipationInfo } from './build-campaign-participation-info.js';
import { buildCampaignParticipationOverview } from './build-campaign-participation-overview.js';
import { buildCampaignParticipationResult } from './build-campaign-participation-result.js';
import { buildCampaignReport } from './build-campaign-report.js';
import { buildCampaignToJoin } from './build-campaign-to-join.js';
import { buildCampaignToStartParticipation } from './build-campaign-to-start-participation.js';
import { buildCenter, buildMatchingOrganization } from './build-center.js';
import { buildCenterForAdmin } from './build-center-for-admin.js';
import { buildCertifiableBadgeAcquisition } from './build-certifiable-badge-acquisition.js';
import { buildCertificationAssessment } from './build-certification-assessment.js';
import { buildCertificationAssessmentScore } from './build-certification-assessment-score.js';
import { buildCertificationAssessmentScoreV3 } from './build-certification-assessment-score-v3.js';
import { buildCertificationAttestation } from './build-certification-attestation.js';
import { buildCertificationCandidate } from './build-certification-candidate.js';
import { buildCertificationCandidateForAttendanceSheet } from './build-certification-candidate-for-attendance-sheet.js';
import { buildCertificationCandidateForSupervising } from './build-certification-candidate-for-supervising.js';
import { buildCertificationCandidateSubscription } from './build-certification-candidate-subscription.js';
import { buildCertificationCenter } from './build-certification-center.js';
import { buildCertificationCenterInvitation } from './build-certification-center-invitation.js';
import { buildCertificationCenterMembership } from './build-certification-center-membership.js';
import { buildCertificationChallenge } from './build-certification-challenge.js';
import { buildCertificationChallengeLiveAlert } from './build-certification-challenge-live-alert.js';
import { buildCertificationChallengeWithType } from './build-certification-challenge-with-type.js';
import { buildCertificationCompanionLiveAlert } from './build-certification-companion-live-alert.js';
import { buildCertificationCourse } from './build-certification-course.js';
import { buildCertificationCpfCity } from './build-certification-cpf-city.js';
import { buildCertificationCpfCountry } from './build-certification-cpf-country.js';
import { buildCertificationIssueReport } from './build-certification-issue-report.js';
import { buildCertificationOfficer } from './build-certification-officer.js';
import { buildCertificationPointOfContact } from './build-certification-point-of-contact.js';
import { buildCertificationReport } from './build-certification-report.js';
import { buildCertificationResult } from './build-certification-result.js';
import { buildCertificationScoringCompletedEvent } from './build-certification-scoring-completed-event.js';
import { buildCertificationSessionCandidate } from './build-certification-session-candidate.js';
import { buildCertifiedArea } from './build-certified-area.js';
import { buildCertifiedCompetence } from './build-certified-competence.js';
import { buildCertifiedProfile } from './build-certified-profile.js';
import { buildCertifiedSkill } from './build-certified-skill.js';
import { buildCertifiedTube } from './build-certified-tube.js';
import { buildChallenge, buildChallengeWithWebComponent } from './build-challenge.js';
import { buildChallengeLearningContentDataObject } from './build-challenge-learning-content-data-object.js';
import { buildCleaCertifiedCandidate } from './build-clea-certified-candidate.js';
import { buildClientApplication } from './build-client-application.js';
import { buildCombinedCourseDetails } from './build-combined-course-details.js';
import { buildCompetence } from './build-competence.js';
import { buildCompetenceEvaluation } from './build-competence-evaluation.js';
import { buildCompetenceMark } from './build-competence-mark.js';
import { buildCompetenceResult } from './build-competence-result.js';
import { buildCompetenceTree } from './build-competence-tree.js';
import { buildComplementaryCertificationBadgeForAdmin } from './build-complementary-certification-badge-for-admin.js';
import { buildComplementaryCertificationCourseResult } from './build-complementary-certification-course-result.js';
import { buildComplementaryCertificationCourseResultForJuryCertification } from './build-complementary-certification-course-result-for-certification.js';
import { buildComplementaryCertificationCourseResultForJuryCertificationWithExternal } from './build-complementary-certification-course-result-for-certification-with-external.js';
import { buildComplementaryCertificationForSupervising } from './build-complementary-certification-for-supervising.js';
import { buildComplementaryCertificationForTargetProfileAttachment } from './build-complementary-certification-for-target-profile-attachment.js';
import { buildComplementaryCertificationHabilitation } from './build-complementary-certification-habilitation.js';
import { buildComplementaryCertificationTargetProfileHistory } from './build-complementary-certification-target-profile-history-for-admin.js';
import {
  buildComplementaryCertificationBadge as buildCertificationComplementaryCertificationBadge,
  buildComplementaryCertificationVersioning,
} from './build-complementary-certification-versioning.js';
import { buildCountry } from './build-country.js';
import { buildCourse } from './build-course.js';
import { buildCpfCertificationResult } from './build-cpf-certification-result.js';
import * as buildDataProtectionOfficer from './build-data-protection-officer.js';
import { buildFeedback } from './build-feedback.js';
import { buildFinalizedSession } from './build-finalized-session.js';
import { buildFlashAlgorithmConfiguration } from './build-flash-algorithm-configuration.js';
import { buildFramework } from './build-framework.js';
import { buildHabilitation } from './build-habilitation.js';
import { buildHint } from './build-hint.js';
import { buildJuryCertification } from './build-jury-certification.js';
import { buildJuryCertificationSummary } from './build-jury-certification-summary.js';
import { buildJurySession } from './build-jury-session.js';
import { buildKnowledgeElement } from './build-knowledge-element.js';
import { buildLearningContent } from './build-learning-content.js';
import { buildLegalDocument } from './build-legal-document.js';
import { buildMembership } from './build-membership.js';
import { buildMission } from './build-mission.js';
import { buildOrganization } from './build-organization.js';
import { buildOrganizationForAdmin } from './build-organization-for-admin.js';
import { buildOrganizationInvitation } from './build-organization-invitation.js';
import { buildOrganizationLearner } from './build-organization-learner.js';
import { buildOrganizationLearnerForAdmin } from './build-organization-learner-for-admin.js';
import { buildOrganizationLearnerParticipation } from './build-organization-learner-participation.js';
import { buildOrganizationPlacesLot } from './build-organization-places-lot.js';
import { buildOrganizationPlacesLotManagement } from './build-organization-places-lot-management.js';
import { buildOrganizationTag } from './build-organization-tag.js';
import { buildOrganizationsToAttachToTargetProfile } from './build-organizations-to-attach-to-target-profile.js';
import { buildParticipationForCampaignManagement } from './build-participation-for-campaign-management.js';
import { buildPlacementProfile } from './build-placement-profile.js';
import { buildPoleEmploiSending } from './build-pole-emploi-sending.js';
import { buildPrescriber } from './build-prescriber.js';
import { buildPrivateCertificate } from './build-private-certificate.js';
import { buildPrivateCertificate as buildPrivateCertificateWithCompetenceTree } from './build-private-certificate-with-competence-tree.js';
import { buildProgression } from './build-progression.js';
import { buildReproducibilityRate } from './build-reproducibility-rate.js';
import { buildResultCompetenceTree } from './build-result-competence-tree.js';
import { buildSchoolAssessment } from './build-school-assessment.js';
import { buildSCOCertificationCandidate } from './build-sco-certification-candidate.js';
import { buildScoringAndCapacitySimulatorReport } from './build-scoring-and-capacity-simulator-report.js';
import { buildSessionForAttendanceSheet } from './build-session-for-attendance-sheet.js';
import { buildSessionForInvigilatorKit } from './build-session-for-invigilator-kit.js';
import { buildSessionForSupervising } from './build-session-for-supervising.js';
import { buildSessionJuryComment } from './build-session-jury-comment.js';
import { buildSessionSummary } from './build-session-summary.js';
import { buildShareableCertificate } from './build-shareable-certificate.js';
import { buildSkill } from './build-skill.js';
import { BuildSkillCollection as buildSkillCollection } from './build-skill-collection.js';
import { buildSkillLearningContentDataObject } from './build-skill-learning-content-data-object.js';
import { buildSolution } from './build-solution.js';
import { buildStage } from './build-stage.js';
import { buildStageAcquisition } from './build-stage-acquisition.js';
import { buildSupOrganizationLearner } from './build-sup-organization-learner.js';
import { buildTag } from './build-tag.js';
import { buildTargetProfile } from './build-target-profile.js';
import { buildTargetProfileForAdmin } from './build-target-profile-for-admin.js';
import { buildTargetProfileForCreation } from './build-target-profile-for-creation.js';
import { buildTargetProfileHistoryForAdmin } from './build-target-profile-history-for-admin.js';
import { buildTargetProfileSummaryForAdmin } from './build-target-profile-summary-for-admin.js';
import { buildThematic } from './build-thematic.js';
import { buildTraining } from './build-training.js';
import { buildTrainingForAdmin } from './build-training-for-admin.js';
import { buildTrainingSummary } from './build-training-summary.js';
import { buildTrainingTrigger } from './build-training-trigger.js';
import { buildTrainingTriggerForAdmin } from './build-training-trigger-for-admin.js';
import { buildTrainingTriggerTube } from './build-training-trigger-tube.js';
import { buildTube } from './build-tube.js';
import { buildTutorial } from './build-tutorial.js';
import { buildTutorialForUser } from './build-tutorial-for-user.js';
import { buildUser } from './build-user.js';
import { buildUserCompetence } from './build-user-competence.js';
import { buildUserDetailsForAdmin } from './build-user-details-for-admin.js';
import { buildUserOrgaSettings } from './build-user-orga-settings.js';
import { buildUserSavedTutorial } from './build-user-saved-tutorial.js';
import { buildUserScorecard } from './build-user-scorecard.js';
import { buildV3CertificationChallengeForAdministration } from './build-v3-certification-challenge-for-administration.js';
import { buildV3CertificationChallengeLiveAlertForAdministration } from './build-v3-certification-challenge-live-alert-for-administration.js';
import { buildV3CertificationCourseDetailsForAdministration } from './build-v3-certification-course-details-for-administration.js';
import { buildValidation } from './build-validation.js';
import { buildValidator } from './build-validator.js';
import { buildComplementaryCertification } from './certification/complementary-certification/build-complementary-certification.js';
import { buildComplementaryCertificationBadge } from './certification/complementary-certification/build-complementary-certification-badge.js';
import { buildActiveCalibratedChallenge } from './certification/configuration/build-active-calibrated-challenge.js';
import { buildCenter as buildConfigurationCenter } from './certification/configuration/build-center.js';
import { buildCertificationFrameworksChallenge } from './certification/configuration/build-certification-frameworks-challenge.js';
import { buildConsolidatedFramework } from './certification/configuration/build-consolidated-framework.js';
import { buildCandidate } from './certification/enrolment/build-candidate.js';
import { buildCertificationEligibility } from './certification/enrolment/build-certification-eligibility.js';
import { buildComplementaryCertificationBadgeWithOffsetVersion as buildComplementaryCertificationBadgeForEnrolment } from './certification/enrolment/build-complementary-certification-badge.js';
import { buildComplementaryCertificationCourseWithResultsEnrolment } from './certification/enrolment/build-complementary-certification-course-with-results.js';
import { buildEditedCandidate } from './certification/enrolment/build-edited-candidate.js';
import { buildEnrolledCandidate } from './certification/enrolment/build-enrolled-candidate.js';
import { buildPixCertification } from './certification/enrolment/build-pix-certification.js';
import { buildSessionEnrolment } from './certification/enrolment/build-session.js';
import {
  buildComplementarySubscription,
  buildCoreSubscription,
  buildSubscription,
} from './certification/enrolment/build-subscription.js';
import { buildUserEnrolment } from './certification/enrolment/build-user.js';
import { buildUserCertificationEligibility } from './certification/enrolment/build-user-certification-eligibility.js';
import { buildEvaluationCandidate } from './certification/evaluation/build-candidate.js';
import { buildComplementaryCertificationScoringCriteria } from './certification/evaluation/build-complementary-certification-scoring-criteria.js';
import { buildComplementaryCertificationScoringWithoutComplementaryReferential } from './certification/evaluation/build-complementary-certification-scoring-without-complementary-referential.js';
import { buildDoubleCertificationScoring } from './certification/evaluation/build-double-certification-scoring.js';
import { buildFlashAssessmentAlgorithm } from './certification/evaluation/build-flash-assessment-algorithm.js';
import { buildComplementaryCertificationScoringWithComplementaryReferential } from './certification/evaluation/build-pix-plus-certification-scoring.js';
import { buildResultsSession } from './certification/evaluation/build-session.js';
import { buildGlobalCertificationLevel } from './certification/results/build-global-mesh-level.js';
import { buildCertificationResult as parcoursupCertificationResult } from './certification/results/parcoursup/build-certification-result.js';
import { buildCompetence as parcoursupCompetence } from './certification/results/parcoursup/build-competence.js';
import { buildAssessmentResult as buildCertificationScoringAssessmentResult } from './certification/scoring/build-assessment-result.js';
import { buildCertificationAssessmentHistory } from './certification/scoring/build-certification-assessment-history.js';
import { buildCertificationChallengeCapacity } from './certification/scoring/build-certification-challenge-capacity.js';
import { buildChallengeCalibration } from './certification/scoring/build-challenge-calibration.js';
import { buildAllowedCertificationCenterAccess as buildSessionManagementAllowedCertificationCenterAccess } from './certification/session-management/build-allowed-certification-center-access.js';
import { buildCertificationCandidate as buildSessionManagementCandidate } from './certification/session-management/build-certification-candidate.js';
import { buildCertificationDetails } from './certification/session-management/build-certification-details.js';
import { buildCertificationSessionComplementaryCertification } from './certification/session-management/build-certification-session-complementary-certification.js';
import { buildJurySessionCounters } from './certification/session-management/build-jury-session-counters.js';
import { buildSessionManagement } from './certification/session-management/build-session.js';
import { buildCompetenceForScoring } from './certification/shared/build-competence-for-scoring.js';
import { buildComplementaryCertification as buildSharedComplementaryCertification } from './certification/shared/build-complementary-certification.js';
import { buildJuryComment } from './certification/shared/build-jury-comment.js';
import { buildV3CertificationScoring } from './certification/shared/build-v3-certification-scoring.js';
import {
  buildLtiPlatformRegistration,
  buildLtiPlatformRegistrationWithPlatformConfig,
} from './identity-access-management/build-lti-platform-registration.js';
import { buildUserLogin } from './identity-access-management/build-user-login.js';
import { buildCampaignParticipation as maddoBuildCampaignParticipation } from './maddo/build-campaign-participation.js';
import { buildTubeCoverage } from './maddo/build-tube-coverage.js';
import { buildOrganizationDto } from './organizational-entities/build-organization-dto.js';
import { buildCampaign as boundedContextCampaignBuildCampaign } from './prescription/campaign/build-campaign.js';
import { buildCampaignResultLevelsPerTubesAndCompetences as boundedContextCampaignBuildCampaignResultLevelsPerTubesAndCompetences } from './prescription/campaign/build-campaign-result-levels-per-tubes-and-competences.js';
import { buildCampaignParticipation as boundedContextCampaignParticipationBuildCampaignParticipation } from './prescription/campaign-participation/build-campaign-participation.js';
import { buildOrganizationLearnerImportFormat } from './prescription/learner-management/build-organization-learner-import-format.js';
import { buildOrganizationToJoin } from './prescription/organization-learner/build-organization-to-join.js';
import { buildStageCollection as buildStageCollectionForTargetProfileManagement } from './target-profile-management/build-stage-collection.js';
import { buildStageCollection as buildStageCollectionForUserCampaignResults } from './user-campaign-results/build-stage-collection.js';

const banner = {
  buildEmptyInformationBanner,
  buildInformationBanner,
};

const certification = {
  configuration: {
    buildCenter: buildConfigurationCenter,
    buildConsolidatedFramework,
    buildCertificationFrameworksChallenge,
    buildActiveCalibratedChallenge,
  },
  complementaryCertification: {
    buildComplementaryCertificationBadge: buildComplementaryCertificationBadge,
    buildComplementaryCertification: buildComplementaryCertification,
  },
  scoring: {
    buildAssessmentResult: buildCertificationScoringAssessmentResult,
    buildChallengeCalibration,
  },
  enrolment: {
    buildSession: buildSessionEnrolment,
    buildCenter,
    buildMatchingOrganization,
    buildHabilitation,
    buildCertificationSessionCandidate,
    buildEnrolledCandidate,
    buildCandidate,
    buildCoreSubscription,
    buildComplementarySubscription,
    buildEditedCandidate,
    buildSubscription,
    buildUser: buildUserEnrolment,
    buildComplementaryCertificationCourseWithResults: buildComplementaryCertificationCourseWithResultsEnrolment,
    buildUserCertificationEligibility,
    buildCertificationEligibility,
    buildPixCertification,
    buildComplementaryCertificationBadge: buildComplementaryCertificationBadgeForEnrolment,
  },
  evaluation: {
    buildCandidate: buildEvaluationCandidate,
    buildResultsSession,
    buildComplementaryCertificationScoringCriteria,
    buildComplementaryCertificationScoringWithoutComplementaryReferential,
    buildComplementaryCertificationScoringWithComplementaryReferential,
    buildDoubleCertificationScoring,
  },
  sessionManagement: {
    buildAllowedCertificationCenterAccess: buildSessionManagementAllowedCertificationCenterAccess,
    buildCertificationSessionComplementaryCertification,
    buildSession: buildSessionManagement,
    buildCertificationCandidate: buildSessionManagementCandidate,
    buildJurySessionCounters,
  },
  shared: {
    buildCertificationCompanionLiveAlert,
    buildJuryComment: buildJuryComment,
    buildComplementaryCertification: buildSharedComplementaryCertification,
  },
  lib: {
    buildComplementaryCertificationVersioning,
    buildComplementaryCertificationBadge: buildCertificationComplementaryCertificationBadge,
  },
  results: {
    buildGlobalCertificationLevel,
    buildCertificate,
    parcoursup: {
      buildCertificationResult: parcoursupCertificationResult,
      buildCompetence: parcoursupCompetence,
    },
  },
};

const prescription = {
  organizationLearner: {
    buildOrganizationToJoin,
  },
  learnerManagement: {
    buildOrganizationLearnerImportFormat,
  },
  campaign: {
    buildCampaign: boundedContextCampaignBuildCampaign,
    buildCampaignResultLevelsPerTubesAndCompetences:
      boundedContextCampaignBuildCampaignResultLevelsPerTubesAndCompetences,
  },
  campaignParticipation: {
    buildCampaignParticipation: boundedContextCampaignParticipationBuildCampaignParticipation,
  },
};

const devcomp = {
  buildPassage,
};

const identityAccessManagement = {
  buildUserLogin,
  buildLtiPlatformRegistration,
  buildLtiPlatformRegistrationWithPlatformConfig,
};

const organizationalEntities = {
  buildOrganizationDto,
};

const maddo = {
  buildCampaignParticipation: maddoBuildCampaignParticipation,
  buildTubeCoverage,
};

export {
  banner,
  buildAccountRecoveryDemand,
  buildActivity,
  buildActivityAnswer,
  buildAdministrationTeam,
  buildAdminMember,
  buildAllowedCertificationCenterAccess,
  buildAnswer,
  buildArea,
  buildAssessment,
  buildAssessmentResult,
  buildAttestationUserDetail,
  buildAuthenticationMethod,
  buildBadge,
  buildBadgeCriterion,
  buildBadgeCriterionForCalculation,
  buildBadgeDetails,
  buildBadgeForCalculation,
  buildBadgeToAttach,
  buildCampaign,
  buildCampaignCollectiveResult,
  buildCampaignLearningContent,
  buildCampaignManagement,
  buildCampaignParticipation,
  buildCampaignParticipationForUserManagement,
  buildCampaignParticipationInfo,
  buildCampaignParticipationOverview,
  buildCampaignParticipationResult,
  buildCampaignReport,
  buildCampaignToJoin,
  buildCampaignToStartParticipation,
  buildCenterForAdmin,
  buildCertifiableBadgeAcquisition,
  buildCertificationAssessment,
  buildCertificationAssessmentHistory,
  buildCertificationAssessmentScore,
  buildCertificationAssessmentScoreV3,
  buildCertificationAttestation,
  buildCertificationCandidate,
  buildCertificationCandidateForAttendanceSheet,
  buildCertificationCandidateForSupervising,
  buildCertificationCandidateSubscription,
  buildCertificationCenter,
  buildCertificationCenterInvitation,
  buildCertificationCenterMembership,
  buildCertificationChallenge,
  buildCertificationChallengeCapacity,
  buildCertificationChallengeLiveAlert,
  buildCertificationChallengeWithType,
  buildCertificationCompanionLiveAlert,
  buildCertificationCourse,
  buildCertificationCpfCity,
  buildCertificationCpfCountry,
  buildCertificationDetails,
  buildCertificationIssueReport,
  buildCertificationOfficer,
  buildCertificationPointOfContact,
  buildCertificationReport,
  buildCertificationResult,
  buildCertificationScoringCompletedEvent,
  buildCertifiedArea,
  buildCertifiedCompetence,
  buildCertifiedProfile,
  buildCertifiedSkill,
  buildCertifiedTube,
  buildChallenge,
  buildChallengeLearningContentDataObject,
  buildChallengeWithWebComponent,
  buildCleaCertifiedCandidate,
  buildClientApplication,
  buildCombinedCourseDetails,
  buildCompetence,
  buildCompetenceEvaluation,
  buildCompetenceForScoring,
  buildCompetenceMark,
  buildCompetenceResult,
  buildCompetenceTree,
  buildComplementaryCertificationBadgeForAdmin,
  buildComplementaryCertificationCourseResult,
  buildComplementaryCertificationCourseResultForJuryCertification,
  buildComplementaryCertificationCourseResultForJuryCertificationWithExternal,
  buildComplementaryCertificationForSupervising,
  buildComplementaryCertificationForTargetProfileAttachment,
  buildComplementaryCertificationHabilitation,
  buildComplementaryCertificationTargetProfileHistory,
  buildCountry,
  buildCourse,
  buildCpfCertificationResult,
  buildDataProtectionOfficer,
  buildFeedback,
  buildFinalizedSession,
  buildFlashAlgorithmConfiguration,
  buildFlashAssessmentAlgorithm,
  buildFramework,
  buildHint,
  buildJuryCertification,
  buildJuryCertificationSummary,
  buildJurySession,
  buildKnowledgeElement,
  buildLearningContent,
  buildLegalDocument,
  buildMembership,
  buildMission,
  buildOrganization,
  buildOrganizationForAdmin,
  buildOrganizationInvitation,
  buildOrganizationLearner,
  buildOrganizationLearnerForAdmin,
  buildOrganizationLearnerParticipation,
  buildOrganizationPlacesLot,
  buildOrganizationPlacesLotManagement,
  buildOrganizationsToAttachToTargetProfile,
  buildOrganizationTag,
  buildParticipationForCampaignManagement,
  buildPlacementProfile,
  buildPoleEmploiSending,
  buildPrescriber,
  buildPrivateCertificate,
  buildPrivateCertificateWithCompetenceTree,
  buildProgression,
  buildReproducibilityRate,
  buildResultCompetenceTree,
  buildSchoolAssessment,
  buildSCOCertificationCandidate,
  buildScoringAndCapacitySimulatorReport,
  buildSessionForAttendanceSheet,
  buildSessionForInvigilatorKit,
  buildSessionForSupervising,
  buildSessionJuryComment,
  buildSessionSummary,
  buildShareableCertificate,
  buildSkill,
  buildSkillCollection,
  buildSkillLearningContentDataObject,
  buildSolution,
  buildStage,
  buildStageAcquisition,
  buildStageCollectionForTargetProfileManagement,
  buildStageCollectionForUserCampaignResults,
  buildSupOrganizationLearner,
  buildTag,
  buildTargetProfile,
  buildTargetProfileForAdmin,
  buildTargetProfileForCreation,
  buildTargetProfileHistoryForAdmin,
  buildTargetProfileSummaryForAdmin,
  buildThematic,
  buildTraining,
  buildTrainingForAdmin,
  buildTrainingSummary,
  buildTrainingTrigger,
  buildTrainingTriggerForAdmin,
  buildTrainingTriggerTube,
  buildTube,
  buildTutorial,
  buildTutorialForUser,
  buildUser,
  buildUserCompetence,
  buildUserDetailsForAdmin,
  buildUserOrgaSettings,
  buildUserSavedTutorial,
  buildUserScorecard,
  buildV3CertificationChallengeForAdministration,
  buildV3CertificationChallengeLiveAlertForAdministration,
  buildV3CertificationCourseDetailsForAdministration,
  buildV3CertificationScoring,
  buildValidation,
  buildValidator,
  certification,
  devcomp,
  identityAccessManagement,
  maddo,
  organizationalEntities,
  prescription,
};
