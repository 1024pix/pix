const AdminMember = require('../../../../lib/domain/read-models/AdminMember');
const { ROLES } = require('../../../../lib/domain/constants').PIX_ADMIN;

module.exports = function buildAdminMember({
  id = 1,
  userId = 1,
  firstName = 'Dimitri',
  lastName = 'Kramatorsk',
  email = 'dimitri.k@pix.fr',
  role = ROLES.SUPER_ADMIN,
} = {}) {
  return new AdminMember({ id, userId, firstName, lastName, email, role });
};
