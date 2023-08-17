import { buildArchivedOrganizations } from './build-archived-organizations.js';
import { buildBlockedUsers } from './build-blocked-users.js';
import { buildOrganizationUsers } from './build-organization-users.js';
import { buildPixAdminRoles } from './build-pix-admin-roles.js';
import { buildScoOrganizationLearners } from './build-sco-organization-learners.js';
import { buildScoOrganizations } from './build-sco-organizations.js';
import { buildTemporaryBlockedUsers } from './build-temporary-blocked-user.js';
import { buildUsers } from './build-users.js';

async function teamAccesDataBuilder(databaseBuilder) {
  buildPixAdminRoles(databaseBuilder);
  buildUsers(databaseBuilder);
  buildBlockedUsers(databaseBuilder);
  buildTemporaryBlockedUsers(databaseBuilder);
  buildOrganizationUsers(databaseBuilder);
  buildScoOrganizations(databaseBuilder);
  buildArchivedOrganizations(databaseBuilder);
  buildScoOrganizationLearners(databaseBuilder);
}

export { teamAccesDataBuilder };
