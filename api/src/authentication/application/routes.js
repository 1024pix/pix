import { oidcProviderAdminRoutes } from './oidc-provider.admin.route.js';
import { samlRoutes } from './saml.route.js';
import { tokenRoutes } from './token.route.js';

const register = async function (server) {
  server.route([...oidcProviderAdminRoutes, ...samlRoutes, ...tokenRoutes]);
};

const name = 'authentication-api';

const authenticationRoutes = [{ register, name }];

export { authenticationRoutes };
