import { buildAllowedCertificationCenterAccess } from './build-allowed-certification-center-access.js';
import { candidateAuthorizationInfoBuilder } from './build-candidate-authorization-info.js';
import { buildCertificationCandidate } from './build-certification-candidate.js';
import { buildCertificationCourse } from './build-certification-course.js';
import { buildCertificationDetails } from './build-certification-details.js';
import { buildCertificationSessionComplementaryCertification } from './build-certification-session-complementary-certification.js';
import { buildJuryCertification } from './build-jury-certification.js';
import { buildJuryCertificationSummary } from './build-jury-certification-summary.js';
import { buildJurySessionCounters } from './build-jury-session-counters.js';
import { buildSession } from './build-session.js';
import { sessionForSupervisingBuilder } from './build-session-for-supervising.js';
import { buildSessionManagement } from './build-session-management.js';

export const builders = {
  buildAllowedCertificationCenterAccess,
  buildCertificationCandidate,
  buildCertificationCourse,
  buildCertificationDetails,
  buildCertificationSessionComplementaryCertification,
  buildJuryCertification,
  buildJuryCertificationSummary,
  buildJurySessionCounters,
  buildSessionManagement,
  buildSession,
  sessionForSupervisingBuilder,
  candidateAuthorizationInfoBuilder,
};
