const { PIX_MASTER_ID } = require('./users-builder');
module.exports = function usersPixRolesBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildUserPixRole({ userId: PIX_MASTER_ID, pixRoleId: 1 });
  databaseBuilder.factory.buildUserPixRole({ userId: 200, pixRoleId: 1 });
};
