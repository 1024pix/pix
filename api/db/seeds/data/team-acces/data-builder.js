import { buildBlockedUsers } from './build-blocked-users.js';
import { buildPixAdminRoles } from './build-pix-admin-roles.js';
import { buildScoOrganizations } from './build-sco-organizations.js';
import { buildTemporaryBlockedUsers } from './build-temporary-blocked-user.js';
import { buildUsers } from './build-users.js';
import { buildOrganizationUsers } from './build-organization-users.js';
import { buildArchivedOrganizations } from './build-archived-organizations.js';
import { buildScoOrganizationLearners } from './build-sco-organization-learners.js';
import { buildCertificationCenters } from './build-certification-centers.js';
import { buildResetPasswordUsers } from './build-reset-password-users.js';

async function teamAccesDataBuilder(databaseBuilder) {
  buildPixAdminRoles(databaseBuilder);
  buildUsers(databaseBuilder);
  buildBlockedUsers(databaseBuilder);
  buildResetPasswordUsers(databaseBuilder);
  buildTemporaryBlockedUsers(databaseBuilder);
  buildOrganizationUsers(databaseBuilder);
  buildScoOrganizations(databaseBuilder);
  buildArchivedOrganizations(databaseBuilder);
  buildScoOrganizationLearners(databaseBuilder);
  await buildCertificationCenters(databaseBuilder);
}

export { teamAccesDataBuilder };
