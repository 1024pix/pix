import { userRoutes } from './user.route.js';

const register = async function (server) {
  server.route([...userRoutes]);
};

const name = 'user-account-api';

const userAccountRoutes = [{ register, name }];

export { userAccountRoutes };
