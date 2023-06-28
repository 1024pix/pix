import * as accountRecovery from './shared/application/account-recovery/index.js';
import * as adminMembers from './shared/application/admin-members/index.js';
import * as answers from './shared/application/answers/index.js';
import * as assessmentResults from './shared/application/assessment-results/index.js';
import * as assessments from './shared/application/assessments/index.js';
import * as authentication from './shared/application/authentication/index.js';
import * as authenticationOidc from './shared/application/authentication/oidc/index.js';
import * as badges from './shared/application/badges/index.js';
import * as cache from './shared/application/cache/index.js';
import * as campaignParticipations from './shared/application/campaign-participations/index.js';
import * as campaigns from './shared/application/campaigns/index.js';
import * as campaignsAdministration from './shared/application/campaigns-administration/index.js';
import * as certificationCandidates from './shared/application/certification-candidates/index.js';
import * as certificationCenters from './shared/application/certification-centers/index.js';
import * as certificationCenterInvitations from './shared/application/certification-center-invitations/index.js';
import * as certificationCenterMemberships from './shared/application/certification-center-memberships/index.js';
import * as certificationCourses from './shared/application/certification-courses/index.js';
import * as certificationPointOfContacts from './shared/application/certification-point-of-contacts/index.js';
import * as certificationLivretScolaire from './shared/application/certification-livret-scolaire/index.js';
import * as certificationReports from './shared/application/certification-reports/index.js';
import * as certificationIssueReports from './shared/application/certification-issue-reports/index.js';
import * as certifications from './shared/application/certifications/index.js';
import * as challenges from './shared/application/challenges/index.js';
import * as competenceEvaluations from './shared/application/competence-evaluations/index.js';
import * as complementaryCertifications from './shared/application/complementary-certifications/index.js';
import * as complementaryCertificationCourseResults from './shared/application/complementary-certification-course-results/index.js';
import * as countries from './shared/application/countries/index.js';
import * as courses from './shared/application/courses/index.js';
import * as featureToggles from './shared/application/feature-toggles/index.js';
import * as feedbacks from './shared/application/feedbacks/index.js';
import * as healthcheck from './shared/application/healthcheck/index.js';
import * as lcms from './shared/application/lcms/index.js';
import * as memberships from './shared/application/memberships/index.js';
import * as organizationInvitations from './shared/application/organization-invitations/index.js';
import * as organizations from './shared/application/organizations/index.js';
import * as organizationsAdministration from './shared/application/organizations-administration/index.js';
import * as organizationLearners from './shared/application/organization-learners/index.js';
import * as organizationLearnersManagement from './shared/application/organization-learners-management/index.js';
import * as passwords from './shared/application/passwords/index.js';
import * as poleEmploi from './shared/application/pole-emploi/index.js';
import * as prescribers from './shared/application/prescribers/index.js';
import * as progressions from './shared/application/progressions/index.js';
import * as saml from './shared/application/saml/index.js';
import * as stageCollection from './shared/application/stage-collections/index.js';
import * as scoringSimulator from './shared/application/scoring-simulator/index.js';

import * as scenarioSimulator from './shared/application/scenarios-simulator/index.js';
import * as scorecards from './shared/application/scorecards/index.js';
import * as scoOrganizationLearners from './shared/application/sco-organization-learners/index.js';
import * as supOrganizationLearners from './shared/application/sup-organization-learners/index.js';
import * as sessions from './shared/application/sessions/index.js';
import * as sessionBoundedContext from './certification/application/session/index.js';
import * as tags from './shared/application/tags/index.js';
import * as targetProfiles from './shared/application/target-profiles/index.js';
import * as targetProfilesManagement from './shared/application/target-profiles-management/index.js';
import * as trainings from './shared/application/trainings/index.js';
import * as missions from './shared/application/missions/index.js';
import * as frameworks from './shared/application/frameworks/index.js';
import * as tutorialEvaluations from './shared/application/tutorial-evaluations/index.js';
import * as userOrgaSettings from './shared/application/user-orga-settings/index.js';
import * as userTutorials from './shared/application/user-tutorials/index.js';
import * as users from './shared/application/users/index.js';

const routes = [
  accountRecovery,
  adminMembers,
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
  competenceEvaluations,
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
  organizationLearnersManagement,
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
  sessionBoundedContext,
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
