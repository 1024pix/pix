import { attachTargetProfileRoute } from './application/attach-target-profile-route.js';
import { certificationFrameworkRoute } from './application/certification-framework-route.js';
import { certificationVersionRoute } from './application/certification-version-route.js';
import { complementaryCertificationRoute } from './application/complementary-certification-route.js';
import { scoBlockedAccessDatesRoute } from './application/sco-blocked-access-dates-route.js';
import { scoWhitelistRoute } from './application/sco-whitelist-route.js';

const attachTargetProfileRoutes = [attachTargetProfileRoute];
const certificationConfigurationRoutes = [
  certificationVersionRoute,
  complementaryCertificationRoute,
  certificationFrameworkRoute,
];
const scoBlockedAccessDatesRoutes = [scoBlockedAccessDatesRoute];
const scoWhitelistRoutes = [scoWhitelistRoute];

export { attachTargetProfileRoutes, certificationConfigurationRoutes, scoBlockedAccessDatesRoutes, scoWhitelistRoutes };
