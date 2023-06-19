import { buildBlockedUsers } from './build-blocked-users.js';
import { buildTemporaryBlockedUsers } from './build-temporary-blocked-user.js';

async function teamAccesDataBuilder(databaseBuilder) {
  /**
   * TODO:
   * - pix admin roles (superadmin - différent du common?, metier, certif, support)
   * - ... à continuer
   */
  buildBlockedUsers(databaseBuilder);
  buildTemporaryBlockedUsers(databaseBuilder);
}

export { teamAccesDataBuilder };
