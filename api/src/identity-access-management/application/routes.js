import { accountRecoveryRoutes } from './account-recovery/account-recovery.route.js';
import { anonymizationAdminRoutes } from './anonymization/anonymization.admin.route.js';
import { oidcProviderAdminRoutes } from './oidc-provider/oidc-provider.admin.route.js';
import { oidcProviderRoutes } from './oidc-provider/oidc-provider.route.js';
import { passwordRoutes } from './password/password.route.js';
import { samlRoutes } from './saml/saml.route.js';
import { scoOrganizationLearnerRoutes } from './sco-organization-learner/sco-organization-learner.route.js';
import { tokenRoutes } from './token/token.route.js';
import { userAdminRoutes } from './user/user.admin.route.js';
import { userRoutes } from './user/user.route.js';

const register = async function (server) {
  server.route([
    ...accountRecoveryRoutes,
    ...anonymizationAdminRoutes,
    ...oidcProviderAdminRoutes,
    ...oidcProviderRoutes,
    ...passwordRoutes,
    ...samlRoutes,
    ...scoOrganizationLearnerRoutes,
    ...tokenRoutes,
    ...userAdminRoutes,
    ...userRoutes,
  ]);
};

const name = 'identity-access-management-api';

export const identityAccessManagementRoutes = [{ register, name }];
