const accountRecovery = require('./application/account-recovery');
const adminMembers = require('./application/admin-members');
const answers = require('./application/answers');
const assessmentResults = require('./application/assessment-results');
const assessments = require('./application/assessments');
const authentication = require('./application/authentication');
const authenticationOidc = require('./application/authentication/oidc');
const badges = require('./application/badges');
const cache = require('./application/cache');
const campaignParticipations = require('./application/campaign-participations');
const campaigns = require('./application/campaigns');
const campaignsAdministration = require('./application/campaigns-administration');
const certificationCandidates = require('./application/certification-candidates');
const certificationCenters = require('./application/certification-centers');
const certificationCenterInvitations = require('./application/certification-center-invitations');
const certificationCenterMemberships = require('./application/certification-center-memberships');
const certificationCourses = require('./application/certification-courses');
const certificationPointOfContacts = require('./application/certification-point-of-contacts');
const certificationLivretScolaire = require('./application/certification-livret-scolaire');
const certificationReports = require('./application/certification-reports');
const certificationIssueReports = require('./application/certification-issue-reports');
const certifications = require('./application/certifications');
const challenges = require('./application/challenges');
const competenceEvaluations = require('./application/competence-evaluations');
const complementaryCertifications = require('./application/complementary-certifications');
const complementaryCertificationCourseResults = require('./application/complementary-certification-course-results');
const countries = require('./application/countries');
const courses = require('./application/courses');
const featureToggles = require('./application/feature-toggles');
const feedbacks = require('./application/feedbacks');
const healthcheck = require('./application/healthcheck');
const lcms = require('./application/lcms');
const memberships = require('./application/memberships');
const organizationInvitations = require('./application/organization-invitations');
const organizations = require('./application/organizations');
const passwords = require('./application/passwords');
const poleEmploi = require('./application/pole-emploi');
const prescribers = require('./application/prescribers');
const progressions = require('./application/progressions');
const saml = require('./application/saml');
const scoringSimulator = require('./application/scoring-simulator');
const organizationLearners = require('./application/organization-learners');
const scorecards = require('./application/scorecards');
const scoOrganizationLearners = require('./application/sco-organization-learners');
const supOrganizationLearners = require('./application/sup-organization-learners');
const sessions = require('./application/sessions');
const stages = require('./application/stages');
const tags = require('./application/tags');
const targetProfiles = require('./application/target-profiles');
const trainings = require('./application/trainings');
const frameworks = require('./application/frameworks');
const tutorialEvaluations = require('./application/tutorial-evaluations');
const userOrgaSettings = require('./application/user-orga-settings');
const userTutorials = require('./application/user-tutorials');
const users = require('./application/users');

module.exports = [
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
  organizations,
  passwords,
  poleEmploi,
  prescribers,
  progressions,
  saml,
  scoringSimulator,
  organizationInvitations,
  scorecards,
  scoOrganizationLearners,
  supOrganizationLearners,
  sessions,
  stages,
  tags,
  targetProfiles,
  trainings,
  frameworks,
  tutorialEvaluations,
  userOrgaSettings,
  userTutorials,
  users,
];
