import * as accountRecovery from './application/account-recovery/index.js';
import * as adminMembers from './application/admin-members/index.js';
import * as activityAnswers from './application/activity-answers/index.js';
import * as answers from './application/answers/index.js';
import * as assessmentResults from './application/assessment-results/index.js';
import * as assessments from './application/assessments/index.js';
import * as authentication from './application/authentication/index.js';
import * as authenticationOidc from './application/authentication/oidc/index.js';
import * as badges from './application/badges/index.js';
import * as cache from './application/cache/index.js';
import * as campaignParticipations from './application/campaign-participations/index.js';
import * as campaigns from './application/campaigns/index.js';
import * as campaignsAdministration from './application/campaigns-administration/index.js';
import * as certificationCandidates from './application/certification-candidates/index.js';
import * as certificationCenters from './application/certification-centers/index.js';
import * as certificationCenterInvitations from './application/certification-center-invitations/index.js';
import * as certificationCenterMemberships from './application/certification-center-memberships/index.js';
import * as certificationCourses from './application/certification-courses/index.js';
import * as certificationPointOfContacts from './application/certification-point-of-contacts/index.js';
import * as certificationLivretScolaire from './application/certification-livret-scolaire/index.js';
import * as certificationReports from './application/certification-reports/index.js';
import * as certificationIssueReports from './application/certification-issue-reports/index.js';
import * as certifications from './application/certifications/index.js';
import * as challenges from './application/challenges/index.js';
import * as complementaryCertifications from './application/complementary-certifications/index.js';
import * as complementaryCertificationCourseResults from './application/complementary-certification-course-results/index.js';
import * as countries from './application/countries/index.js';
import * as courses from './application/courses/index.js';
import * as featureToggles from './application/feature-toggles/index.js';
import * as feedbacks from './application/feedbacks/index.js';
import * as healthcheck from './application/healthcheck/index.js';
import * as lcms from './application/lcms/index.js';
import * as memberships from './application/memberships/index.js';
import * as organizationInvitations from './application/organization-invitations/index.js';
import * as organizations from './application/organizations/index.js';
import * as organizationsAdministration from './application/organizations-administration/index.js';
import * as organizationLearners from './application/organization-learners/index.js';

import * as passwords from './application/passwords/index.js';
import * as poleEmploi from './application/pole-emploi/index.js';
import * as prescribers from './application/prescribers/index.js';
import * as progressions from './application/progressions/index.js';
import * as saml from './application/saml/index.js';
import * as stageCollection from './application/stage-collections/index.js';
import * as scoringSimulator from './application/scoring-simulator/index.js';
import * as scenarioSimulator from './application/scenarios-simulator/index.js';
import * as scorecards from './application/scorecards/index.js';
import * as scoOrganizationLearners from './application/sco-organization-learners/index.js';
import * as supOrganizationLearners from './application/sup-organization-learners/index.js';
import * as sessions from './application/sessions/index.js';
import * as tags from './application/tags/index.js';
import * as targetProfiles from './application/target-profiles/index.js';
import * as targetProfilesManagement from './application/target-profiles-management/index.js';
import * as trainings from './application/trainings/index.js';
import * as missions from './application/missions/index.js';
import * as frameworks from './application/frameworks/index.js';
import * as tutorialEvaluations from './application/tutorial-evaluations/index.js';
import * as userOrgaSettings from './application/user-orga-settings/index.js';
import * as userTutorials from './application/user-tutorials/index.js';
import * as users from './application/users/index.js';

const routes = [
  accountRecovery,
  adminMembers,
  activityAnswers,
  answers,
  assessmentResults,
  assessments,
  authentication,
  authenticationOidc,
  badges,
  cache,
  campaignParticipations,
  campaigns,
  campaignsAdministration,
  certificationCandidates,
  certificationCenters,
  certificationCenterInvitations,
  certificationCenterMemberships,
  certificationCourses,
  certificationPointOfContacts,
  certificationLivretScolaire,
  certificationReports,
  certificationIssueReports,
  certifications,
  challenges,
  complementaryCertifications,
  complementaryCertificationCourseResults,
  countries,
  courses,
  featureToggles,
  feedbacks,
  healthcheck,
  lcms,
  memberships,
  organizationLearners,
  organizations,
  organizationsAdministration,
  passwords,
  poleEmploi,
  prescribers,
  progressions,
  saml,
  scenarioSimulator,
  scoringSimulator,
  organizationInvitations,
  scorecards,
  scoOrganizationLearners,
  supOrganizationLearners,
  stageCollection,
  sessions,
  tags,
  targetProfiles,
  missions,
  targetProfilesManagement,
  trainings,
  frameworks,
  tutorialEvaluations,
  userOrgaSettings,
  userTutorials,
  users,
];

export { routes };
