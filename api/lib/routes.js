import account from './application/account-recovery';
import admin from './application/admin-members';
import answers from './application/answers';
import assessment from './application/assessment-results';
import assessments from './application/assessments';
import authentication from './application/authentication';
import authenticationOidc from './application/authentication/oidc';
import badges from './application/badges';
import cache from './application/cache';
import campaign from './application/campaign-participations';
import campaigns from './application/campaigns';
import campaignsAdministration from './application/campaigns-administration';
import certificationCandidates from './application/certification-candidates';
import certificationCenters from './application/certification-centers';
import certificationInvitations from './application/certification-center-invitations';
import certificationMemberships from './application/certification-center-memberships';
import certificationCourses from './application/certification-courses';
import certificationContacts from './application/certification-point-of-contacts';
import certificationLivret from './application/certification-livret-scolaire';
import certificationReports from './application/certification-reports';
import certificationIssue from './application/certification-issue-reports';
import certifications from './application/certifications';
import challenges from './application/challenges';
import competence from './application/competence-evaluations';
import complementary from './application/complementary-certifications';
import complementaryCertificationCourseResult from './application/complementary-certification-course-results';
import countries from './application/countries';
import courses from './application/courses';
import feature from './application/feature-toggles';
import feedbacks from './application/feedbacks';
import healthcheck from './application/healthcheck';
import lcms from './application/lcms';
import memberships from './application/memberships';
import organization from './application/organization-invitations';
import organizations from './application/organizations';
import passwords from './application/passwords';
import pole from './application/pole-emploi';
import prescribers from './application/prescribers';
import progressions from './application/progressions';
import saml from './application/saml';
import scoring from './application/scoring-simulator';
import organizationLearners from './application/organization-learners';
import scorecards from './application/scorecards';
import sco from './application/sco-organization-learners';
import sup from './application/sup-organization-learners';
import sessions from './application/sessions';
import stages from './application/stages';
import tags from './application/tags';
import target from './application/target-profiles';
import trainings from './application/trainings';
import frameworks from './application/frameworks';
import tutorial from './application/tutorial-evaluations';
import user from './application/user-orga-settings';
import userTutorials from './application/user-tutorials';
import users from './application/users';

export default [
  account,
  admin,
  answers,
  assessment,
  assessments,
  authentication,
  authenticationOidc,
  badges,
  cache,
  campaign,
  campaigns,
  campaignsAdministration,
  certificationCandidates,
  certificationCenters,
  certificationInvitations,
  certificationMemberships,
  certificationCourses,
  certificationContacts,
  certificationLivret,
  certificationReports,
  certificationIssue,
  certifications,
  challenges,
  competence,
  complementary,
  complementaryCertificationCourseResult,
  countries,
  courses,
  feature,
  feedbacks,
  healthcheck,
  lcms,
  memberships,
  organizationLearners,
  organizations,
  passwords,
  pole,
  prescribers,
  progressions,
  saml,
  scoring,
  organization,
  scorecards,
  sco,
  sup,
  sessions,
  stages,
  tags,
  target,
  trainings,
  frameworks,
  tutorial,
  user,
  userTutorials,
  users,
];
