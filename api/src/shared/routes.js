import * as assessmentsRoutes from './application/assessments/index.js';
import * as challengesRoutes from './application/challenges/index.js';
import * as courses from './application/courses/index.js';
import * as featureToggles from './application/feature-toggles/index.js';
import * as lcms from './application/lcms/index.js';

const sharedRoutes = [assessmentsRoutes, challengesRoutes, courses, featureToggles, lcms];

export { sharedRoutes };
