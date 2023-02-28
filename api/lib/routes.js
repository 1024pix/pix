const accountRecovery = require('./application/account-recovery/index.js');
const adminMembers = require('./application/admin-members/index.js');
const answers = require('./application/answers/index.js');
const assessmentResults = require('./application/assessment-results/index.js');
const assessments = require('./application/assessments/index.js');
const authentication = require('./application/authentication/index.js');
const authenticationOidc = require('./application/authentication/oidc/index.js');
const badges = require('./application/badges/index.js');
const cache = require('./application/cache/index.js');
const campaignParticipations = require('./application/campaign-participations/index.js');
const campaigns = require('./application/campaigns/index.js');
const campaignsAdministration = require('./application/campaigns-administration/index.js');
const certificationCandidates = require('./application/certification-candidates/index.js');
const certificationCenters = require('./application/certification-centers/index.js');
const certificationCenterInvitations = require('./application/certification-center-invitations/index.js');
const certificationCenterMemberships = require('./application/certification-center-memberships/index.js');
const certificationCourses = require('./application/certification-courses/index.js');
const certificationPointOfContacts = require('./application/certification-point-of-contacts/index.js');
const certificationLivretScolaire = require('./application/certification-livret-scolaire/index.js');
const certificationReports = require('./application/certification-reports/index.js');
const certificationIssueReports = require('./application/certification-issue-reports/index.js');
const certifications = require('./application/certifications/index.js');
const challenges = require('./application/challenges/index.js');
const competenceEvaluations = require('./application/competence-evaluations/index.js');
const complementaryCertifications = require('./application/complementary-certifications/index.js');
const complementaryCertificationCourseResults = require('./application/complementary-certification-course-results/index.js');
const countries = require('./application/countries/index.js');
const courses = require('./application/courses/index.js');
const featureToggles = require('./application/feature-toggles/index.js');
const feedbacks = require('./application/feedbacks/index.js');
const healthcheck = require('./application/healthcheck/index.js');
const lcms = require('./application/lcms/index.js');
const memberships = require('./application/memberships/index.js');
const organizationInvitations = require('./application/organization-invitations/index.js');
const organizations = require('./application/organizations/index.js');
const passwords = require('./application/passwords/index.js');
const poleEmploi = require('./application/pole-emploi/index.js');
const prescribers = require('./application/prescribers/index.js');
const progressions = require('./application/progressions/index.js');
const saml = require('./application/saml/index.js');
const scoringSimulator = require('./application/scoring-simulator/index.js');
const organizationLearners = require('./application/organization-learners/index.js');
const scorecards = require('./application/scorecards/index.js');
const scoOrganizationLearners = require('./application/sco-organization-learners/index.js');
const supOrganizationLearners = require('./application/sup-organization-learners/index.js');
const sessions = require('./application/sessions/index.js');
const targetProfileManagement = require('./application/target-profile-management/index.js');
const tags = require('./application/tags/index.js');
const targetProfiles = require('./application/target-profiles/index.js');
const trainings = require('./application/trainings/index.js');
const frameworks = require('./application/frameworks/index.js');
const tutorialEvaluations = require('./application/tutorial-evaluations/index.js');
const userOrgaSettings = require('./application/user-orga-settings/index.js');
const userTutorials = require('./application/user-tutorials/index.js');
const users = require('./application/users/index.js');

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
  targetProfileManagement,
  tags,
  targetProfiles,
  trainings,
  frameworks,
  tutorialEvaluations,
  userOrgaSettings,
  userTutorials,
  users,
];
