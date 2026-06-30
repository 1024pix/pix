import { attestationRoute } from './application/attestation-route.js';
import { combinedCourseBlueprintRoute } from './application/combined-course-blueprint-route.js';
import { combinedCourseRoute } from './application/combined-course-route.js';
import { questRoute } from './application/quest-route.js';
import { verifiedCodeRoute } from './application/verified-code-route.js';

const questRoutes = [
  combinedCourseRoute,
  questRoute,
  verifiedCodeRoute,
  combinedCourseBlueprintRoute,
  attestationRoute,
];

export { questRoutes };
