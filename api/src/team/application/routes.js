import { certificationCenterInvitationRoutes } from './certification-center-invitation.route.js';

const register = async function (server) {
  server.route(certificationCenterInvitationRoutes);
};

const name = 'team-api';
const teamRoutes = [{ register, name }];

export { teamRoutes };
