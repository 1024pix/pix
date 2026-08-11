import application from './serializers/application';
import certificationCandidate from './serializers/certification-candidate.js';
import certificationIssueReport from './serializers/certification-issue-report.js';
import certificationPointOfContact from './serializers/certification-point-of-contact.js';
import certificationReport from './serializers/certification-report.js';
import informationBanner from './serializers/information-banner.js';
import sessionEnrolment from './serializers/session-enrolment.js';
import sessionForSupervising from './serializers/session-for-supervising.js';
import sessionManagement from './serializers/session-management.js';
import sessionSummary from './serializers/session-summary.js';
import student from './serializers/student.js';

export default {
  student,
  application,
  certificationCandidate,
  certificationIssueReport,
  certificationPointOfContact,
  certificationReport,
  informationBanner,
  sessionEnrolment,
  sessionForSupervising,
  sessionManagement,
  sessionSummary,
};
