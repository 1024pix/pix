// This file imports and exports all models for explicit registration in config.js

import allowedCertificationCenterAccess from './models/allowed-certification-center-access.js';
import banner from './models/banner.js';
import certificationCandidate from './models/certification-candidate.js';
import certificationCandidateForSupervising from './models/certification-candidate-for-supervising.js';
import certificationCenterInvitation from './models/certification-center-invitation.js';
import certificationCenterInvitationResponse from './models/certification-center-invitation-response.js';
import certificationCenterMembership from './models/certification-center-membership.js';
import certificationIssueReport from './models/certification-issue-report.js';
import certificationPointOfContact from './models/certification-point-of-contact.js';
import certificationReport from './models/certification-report.js';
import country from './models/country.js';
import division from './models/division.js';
import featureToggle from './models/feature-toggle.js';
import informationBanner from './models/information-banner.js';
import invigilatorAuthentication from './models/invigilator-authentication.js';
import member from './models/member.js';
import sessionEnrolment from './models/session-enrolment.js';
import sessionForSupervising from './models/session-for-supervising.js';
import sessionManagement from './models/session-management.js';
import sessionSummary from './models/session-summary.js';
import sessionsMassImportReport from './models/sessions-mass-import-report.js';
import student from './models/student.js';
import user from './models/user.js';

export default {
  allowedCertificationCenterAccess,
  banner,
  certificationCandidate,
  certificationCandidateForSupervising,
  certificationCenterInvitation,
  certificationCenterInvitationResponse,
  certificationCenterMembership,
  certificationIssueReport,
  certificationPointOfContact,
  certificationReport,
  country,
  division,
  featureToggle,
  informationBanner,
  invigilatorAuthentication,
  member,
  sessionEnrolment,
  sessionForSupervising,
  sessionManagement,
  sessionSummary,
  sessionsMassImportReport,
  student,
  user,
};
