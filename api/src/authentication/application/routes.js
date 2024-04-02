import { samlRoutes } from './saml.route.js';
import { tokenRoutes } from './token.route.js';

const register = async function (server) {
  server.route([...tokenRoutes, ...samlRoutes]);
};

const name = 'authentication-api';

const authenticationRoutes = [{ register, name }];

export { authenticationRoutes };
