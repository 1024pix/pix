const { PIX_SUPER_ADMIN_ID } = require('./users-builder');
const { ROLES } = require('../../../lib/domain/constants').PIX_ADMIN;

module.exports = function pixAdminRolesBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildPixAdminRole({ userId: PIX_SUPER_ADMIN_ID, role: ROLES.SUPER_ADMIN });
};
