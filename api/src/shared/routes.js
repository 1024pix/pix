import * as assessmentsRoutes from './application/assessments/index.js';
import * as challengesRoutes from './application/challenges/index.js';
import * as courses from './application/courses/index.js';
import * as featureToggles from './application/feature-toggles/index.js';

const sharedRoutes = [assessmentsRoutes, challengesRoutes, courses, featureToggles];

export { sharedRoutes };
