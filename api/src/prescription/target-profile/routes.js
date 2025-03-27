import * as adminTargetProfileRoutes from './application/admin-target-profile-route.js';
import * as frameworkRoutes from './application/framework-route.js';
import * as targetargetProfileRoutes from './application/target-profile-route.js';

const targetProfileRoutes = [adminTargetProfileRoutes, targetargetProfileRoutes, frameworkRoutes];

export { targetProfileRoutes };
