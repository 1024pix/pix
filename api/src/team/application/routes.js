import { adminMemberRoutes } from './admin-member/admin-member.route.js';
import { certificationCenterInvitationAdminRoutes } from './certification-center-invitation/certification-center-invitation.admin.route.js';
import { certificationCenterInvitationRoutes } from './certification-center-invitation/certification-center-invitation.route.js';
import { certificationCenterMembershipAdminRoutes } from './certification-center-membership/certification-center-membership.admin.route.js';
import { certificationCenterMembershipRoute } from './certification-center-membership/certification-center-membership.route.js';
import { membershipAdminRoutes } from './membership/membership.admin.route.js';
import { membershipRoutes } from './membership/membership.route.js';
import { organizationMemberIdentitiesRoute } from './membership/organization-member-identities.route.js';
import { organizationInvitationAdminRoutes } from './organization-invitations/organization-invitation.admin.route.js';
import { organizationInvitationRoutes } from './organization-invitations/organization-invitation.route.js';
import { userOrgaSettingsRoute } from './user-orga-settings.route.js';

const register = async function (server) {
  server.route([
    ...adminMemberRoutes,
    ...certificationCenterInvitationRoutes,
    ...certificationCenterInvitationAdminRoutes,
    ...certificationCenterMembershipRoute,
    ...certificationCenterMembershipAdminRoutes,
    ...membershipAdminRoutes,
    ...membershipRoutes,
    ...organizationMemberIdentitiesRoute,
    ...userOrgaSettingsRoute,
    ...organizationInvitationRoutes,
    ...organizationInvitationAdminRoutes,
  ]);
};

const name = 'team/team-api';

export const teamRoutes = [{ register, name }];
