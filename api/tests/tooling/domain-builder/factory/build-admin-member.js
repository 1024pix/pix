const AdminMember = require('../../../../lib/domain/read-models/AdminMember');
const PixAdminRole = require('../../../../lib/domain/models/PixAdminRole');

module.exports = function buildAdminMember({
  id = 1,
  firstName = 'Dimitri',
  lastName = 'Kramatorsk',
  email = 'dimitri.k@pix.fr',
  role = PixAdminRole.roles.SUPER_ADMIN,
} = {}) {
  return new AdminMember({ id, firstName, lastName, email, role });
};
