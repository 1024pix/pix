import { organizationAdminRoutes } from './organization/organization.admin.route.js';

const register = async function (server) {
  server.route([...organizationAdminRoutes]);
};

const name = 'organizational-entities-api';
const organizationalEntitiesRoutes = [{ register, name }];

export { organizationalEntitiesRoutes };
