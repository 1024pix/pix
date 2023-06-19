import { buildBlockedUsers } from './build-blocked-users.js';
import { buildPixAdminRoles } from './build-pix-admin-roles.js';
import { buildTemporaryBlockedUsers } from './build-temporary-blocked-user.js';

async function teamAccesDataBuilder(databaseBuilder) {
  /**
   * TODO:
   */
  buildPixAdminRoles(databaseBuilder);

  buildBlockedUsers(databaseBuilder);
  buildTemporaryBlockedUsers(databaseBuilder);
}

export { teamAccesDataBuilder };
