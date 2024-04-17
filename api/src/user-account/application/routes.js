import { userAdminRoutes } from './user.admin.route.js';
import { userRoutes } from './user.route.js';

const register = async function (server) {
  server.route([...userRoutes, ...userAdminRoutes]);
};

const name = 'user-account-api';

const userAccountRoutes = [{ register, name }];

export { userAccountRoutes };
