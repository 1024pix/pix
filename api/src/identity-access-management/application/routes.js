import { oidcProviderAdminRoutes } from './oidc-provider/oidc-provider.admin.route.js';
import { oidcProviderRoutes } from './oidc-provider/oidc-provider.route.js';
import { samlRoutes } from './saml/saml.route.js';
import { tokenRoutes } from './token/token.route.js';
import { userAdminRoutes } from './user/user.admin.route.js';
import { userRoutes } from './user/user.route.js';

const register = async function (server) {
  server.route([
    ...oidcProviderAdminRoutes,
    ...oidcProviderRoutes,
    ...samlRoutes,
    ...tokenRoutes,
    ...userAdminRoutes,
    ...userRoutes,
  ]);
};

const name = 'identity-access-management-api';

const identityAccessManagementRoutes = [{ register, name }];

export { identityAccessManagementRoutes };
