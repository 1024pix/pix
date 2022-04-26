const AdminMember = require('../../../../lib/domain/read-models/AdminMember');
const { ROLES } = require('../../../../lib/domain/constants').PIX_ADMIN;

module.exports = function buildAdminMember({
  id = 1,
  userId = 1,
  firstName = 'Dimitri',
  lastName = 'Kramatorsk',
  email = 'dimitri.k@pix.fr',
  role = ROLES.SUPER_ADMIN,
  createdAt = new Date(2022, 4, 11),
  updatedAt,
  disabledAt,
} = {}) {
  return new AdminMember({ id, userId, firstName, lastName, email, role, createdAt, updatedAt, disabledAt });
};
