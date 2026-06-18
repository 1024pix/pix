// This file imports and exports all models for explicit registration in config.js

import adminMember from './models/admin-member';
import administrationTeam from './models/administration-team';
import area from './models/area';
import attachableTargetProfile from './models/attachable-target-profile';
import attachedCertificationCenter from './models/attached-certification-center';
import attestation from './models/attestation.js';
import authenticationMethod from './models/authentication-method';
import autonomousCourse from './models/autonomous-course';
import autonomousCourseListItem from './models/autonomous-course-list-item';
import autonomousCourseTargetProfile from './models/autonomous-course-target-profile';
import badge from './models/badge';
import badgeCriterion from './models/badge-criterion';
import campaign from './models/campaign';
import campaignParticipation from './models/campaign-participation';
import certification from './models/certification';
import certificationCandidate from './models/certification-candidate';
import certificationCandidateTimeline from './models/certification-candidate-timeline';
import certificationCenter from './models/certification-center';
import certificationCenterInvitation from './models/certification-center-invitation';
import certificationCenterMembership from './models/certification-center-membership';
import certificationChallengesForAdministration from './models/certification-challenges-for-administration';
import certificationDetails from './models/certification-details';
import certificationFramework from './models/certification-framework';
import certificationIssueReport from './models/certification-issue-report';
import certificationVersion from './models/certification-version';
import certifiedArea from './models/certified-area';
import certifiedCompetence from './models/certified-competence';
import certifiedProfile from './models/certified-profile';
import certifiedSkill from './models/certified-skill';
import certifiedTube from './models/certified-tube';
import combinedCourseBlueprint from './models/combined-course-blueprint';
import commonComplementaryCertificationCourseResult from './models/common-complementary-certification-course-result';
import competence from './models/competence';
import complementaryCertification from './models/complementary-certification';
import complementaryCertificationBadge from './models/complementary-certification-badge';
import complementaryCertificationCourseResultWithExternal from './models/complementary-certification-course-result-with-external';
import country from './models/country';
import featureToggle from './models/feature-toggle';
import flashAlgorithmConfiguration from './models/flash-algorithm-configuration';
import framework from './models/framework';
import frameworkHistory from './models/framework-history';
import juryCertificationSummary from './models/jury-certification-summary';
import lastApplicationConnection from './models/last-application-connection';
import network from './models/network';
import oidcIdentityProvider from './models/oidc-identity-provider';
import organization from './models/organization';
import organizationInvitation from './models/organization-invitation';
import organizationLearner from './models/organization-learner';
import organizationLearnerImportFormat from './models/organization-learner-import-format';
import organizationMembership from './models/organization-membership';
import organizationPlace from './models/organization-place';
import profile from './models/profile';
import scorecard from './models/scorecard';
import session from './models/session';
import skill from './models/skill';
import stage from './models/stage';
import stageCollection from './models/stage-collection';
import subscription from './models/subscription';
import tag from './models/tag';
import targetProfile from './models/target-profile';
import targetProfileSummary from './models/target-profile-summary';
import thematic from './models/thematic';
import toBePublishedSession from './models/to-be-published-session';
import training from './models/training';
import trainingSummary from './models/training-summary';
import trainingTrigger from './models/training-trigger';
import triggerTube from './models/trigger-tube';
import tube from './models/tube';
import user from './models/user';
import userCertificationCourse from './models/user-certification-course';
import userLogin from './models/user-login';
import userParticipation from './models/user-participation';
import v3CertificationCourseDetailsForAdministration from './models/v3-certification-course-details-for-administration';
import withRequiredActionSession from './models/with-required-action-session';

export default {
  adminMember,
  administrationTeam,
  area,
  attachableTargetProfile,
  attachedCertificationCenter,
  attestation,
  authenticationMethod,
  autonomousCourse,
  autonomousCourseListItem,
  autonomousCourseTargetProfile,
  badge,
  badgeCriterion,
  campaign,
  campaignParticipation,
  certification,
  certificationCandidate,
  certificationCandidateTimeline,
  certificationCenter,
  certificationCenterInvitation,
  certificationCenterMembership,
  certificationChallengesForAdministration,
  certificationDetails,
  certificationFramework,
  certificationIssueReport,
  certificationVersion,
  certifiedArea,
  certifiedCompetence,
  certifiedProfile,
  certifiedSkill,
  certifiedTube,
  combinedCourseBlueprint,
  commonComplementaryCertificationCourseResult,
  competence,
  complementaryCertification,
  complementaryCertificationBadge,
  complementaryCertificationCourseResultWithExternal,
  country,
  featureToggle,
  flashAlgorithmConfiguration,
  framework,
  frameworkHistory,
  juryCertificationSummary,
  lastApplicationConnection,
  network,
  oidcIdentityProvider,
  organization,
  organizationInvitation,
  organizationLearner,
  organizationLearnerImportFormat,
  organizationMembership,
  organizationPlace,
  profile,
  scorecard,
  session,
  skill,
  stage,
  stageCollection,
  subscription,
  tag,
  targetProfile,
  targetProfileSummary,
  thematic,
  toBePublishedSession,
  training,
  trainingSummary,
  trainingTrigger,
  triggerTube,
  tube,
  user,
  userCertificationCourse,
  userLogin,
  userParticipation,
  v3CertificationCourseDetailsForAdministration,
  withRequiredActionSession,
};
