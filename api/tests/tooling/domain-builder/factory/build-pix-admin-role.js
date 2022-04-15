const PixAdminRole = require('../../../../lib/domain/models/PixAdminRole');

module.exports = function buildPixAdminRole({
  id = 1,
  userId,
  role = PixAdminRole.roles.SUPER_ADMIN,
  createdAt = new Date(2022, 4, 11),
  updatedAt,
  disabledAt,
} = {}) {
  return new PixAdminRole({ id, userId, role, createdAt, updatedAt, disabledAt });
};
