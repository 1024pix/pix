import { accountRecoveryRoutes } from './account-recovery/account-recovery.route.js';
import { organizationLearnerAccountRecoveryRoutes } from './account-recovery/organization-learner-account-recovery.route.js';
import { anonymizationAdminRoutes } from './anonymization/anonymization.admin.route.js';
import { ltiRoutes } from './lti/lti.route.js';
import { oidcProviderAdminRoutes } from './oidc-provider/oidc-provider.admin.route.js';
import { oidcProviderRoutes } from './oidc-provider/oidc-provider.route.js';
import { passwordRoutes } from './password/password.route.js';
import { samlRoutes } from './saml/saml.route.js';
import { tokenRoutes } from './token/token.route.js';
import { userAdminRoutes } from './user/user.admin.route.js';
import { userRoutes } from './user/user.route.js';

const allRoutes = [
  ...accountRecoveryRoutes,
  ...anonymizationAdminRoutes,
  ...ltiRoutes,
  ...oidcProviderAdminRoutes,
  ...oidcProviderRoutes,
  ...organizationLearnerAccountRecoveryRoutes,
  ...passwordRoutes,
  ...samlRoutes,
  ...tokenRoutes,
  ...userAdminRoutes,
  ...userRoutes,
];

function register(server, { routes = allRoutes, tags }) {
  if (!tags) {
    server.route(routes);
    return;
  }

  const filteredRoutes = routes.filter((route) =>
    (route.config ?? route.options).tags.some((tag) => tags.includes(tag)),
  );
  server.route(filteredRoutes);
}

const name = 'identity-access-management/identity-access-management-api';

export const identityAccessManagementRoutes = [{ register, name }];
