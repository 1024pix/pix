import * as healthcheck from '../src/shared/application/healthcheck/index.js';
import * as authentication from './application/authentication/index.js';
import * as cache from './application/cache/index.js';
import * as campaignParticipations from './application/campaign-participations/index.js';
import * as certificationCandidates from './application/certification-candidates/index.js';
import * as certificationCenterInvitations from './application/certification-center-invitations/index.js';
import * as certificationCenterMemberships from './application/certification-center-memberships/index.js';
import * as certificationCenters from './application/certification-centers/index.js';
import * as certificationCourses from './application/certification-courses/index.js';
import * as certificationIssueReports from './application/certification-issue-reports/index.js';
import * as certificationLivretScolaire from './application/certification-livret-scolaire/index.js';
import * as certificationPointOfContacts from './application/certification-point-of-contacts/index.js';
import * as certifications from './application/certifications/index.js';
import * as frameworks from './application/frameworks/index.js';
import * as memberships from './application/memberships/index.js';
import * as organizationInvitations from './application/organization-invitations/index.js';
import * as organizationLearners from './application/organization-learners/index.js';
import * as organizations from './application/organizations/index.js';
import * as passwords from './application/passwords/index.js';
import * as poleEmploi from './application/pole-emploi/index.js';
import * as scoOrganizationLearners from './application/sco-organization-learners/index.js';
import * as sessions from './application/sessions/index.js';
import * as supOrganizationLearners from './application/sup-organization-learners/index.js';
import * as tags from './application/tags/index.js';
import * as targetProfiles from './application/target-profiles/index.js';
import * as userOrgaSettings from './application/user-orga-settings/index.js';
import * as users from './application/users/index.js';

const routes = [
  authentication,
  cache,
  campaignParticipations,
  certificationCandidates,
  certificationCenters,
  certificationCenterInvitations,
  certificationCenterMemberships,
  certificationCourses,
  certificationPointOfContacts,
  certificationLivretScolaire,
  certificationIssueReports,
  certifications,
  healthcheck,
  memberships,
  organizationLearners,
  organizations,
  passwords,
  poleEmploi,
  organizationInvitations,
  scoOrganizationLearners,
  supOrganizationLearners,
  sessions,
  tags,
  targetProfiles,
  frameworks,
  userOrgaSettings,
  users,
];

export { routes };
