import { featureToggles } from '../../shared/infrastructure/feature-toggles/index.js';
import { accountRecoveryRoutes } from './account-recovery/account-recovery.route.js';
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
  ...oidcProviderAdminRoutes,
  ...oidcProviderRoutes,
  ...passwordRoutes,
  ...samlRoutes,
  ...tokenRoutes,
  ...userAdminRoutes,
  ...userRoutes,
];

async function register(server, { tags }, dependencies = { allRoutes, ltiRoutes, featureToggles }) {
  const isLtiEnabled = await dependencies.featureToggles.get('isLtiEnabled');
  const routes = isLtiEnabled ? [...dependencies.allRoutes, ...dependencies.ltiRoutes] : dependencies.allRoutes;

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
