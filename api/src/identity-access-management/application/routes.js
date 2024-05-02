import { oidcProviderAdminRoutes } from './oidc-provider.admin.route.js';
import { samlRoutes } from './saml.route.js';
import { tokenRoutes } from './token.route.js';
import { userAdminRoutes } from './user.admin.route.js';
import { userRoutes } from './user.route.js';

const register = async function (server) {
  server.route([...oidcProviderAdminRoutes, ...samlRoutes, ...tokenRoutes, ...userRoutes, ...userAdminRoutes]);
};

const name = 'identity-access-management-api';

const identityAccessManagementRoutes = [{ register, name }];

export { identityAccessManagementRoutes };
