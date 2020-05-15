module.exports = function usersPixRolesBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildUserPixRole({ userId: 5, pixRoleId: 1 });
  databaseBuilder.factory.buildUserPixRole({ userId: 200, pixRoleId: 1 });
};
