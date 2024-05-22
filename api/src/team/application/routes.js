import { certificationCenterInvitationAdminRoutes } from './certification-center-invitation/certification-center-invitation.admin.route.js';
import { certificationCenterInvitationRoutes } from './certification-center-invitation/certification-center-invitation.route.js';

const register = async function (server) {
  server.route([...certificationCenterInvitationRoutes, ...certificationCenterInvitationAdminRoutes]);
};

const name = 'team-api';
const teamRoutes = [{ register, name }];

export { teamRoutes };
