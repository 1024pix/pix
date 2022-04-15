const { PIX_SUPER_ADMIN_ID } = require('./users-builder');

module.exports = function pixAdminRolesBuilder({ databaseBuilder }) {
  databaseBuilder.factory.buildPixAdminRole({ userId: PIX_SUPER_ADMIN_ID, role: 'SUPER_ADMIN' });
};
