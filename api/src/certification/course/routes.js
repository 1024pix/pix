import * as certificationAttestation from './application/certification-attestation-route.js';
import * as certificationCourse from './application/certification-course-route.js';
import * as certificationReports from './application/certification-reports-route.js';

const certificationCourseRoutes = [certificationAttestation, certificationReports, certificationCourse];

export { certificationCourseRoutes };
