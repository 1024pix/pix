const PixAdminRole = require('../../../../lib/domain/models/PixAdminRole');
const { ROLES } = require('../../../../lib/domain/constants').PIX_ADMIN;

module.exports = function buildPixAdminRole({
  id = 1,
  userId = 123,
  role = ROLES.SUPER_ADMIN,
  createdAt = new Date(2022, 4, 11),
  updatedAt,
  disabledAt,
} = {}) {
  return new PixAdminRole({ id, userId, role, createdAt, updatedAt, disabledAt });
};
