function usersPix1321Builder({ databaseBuilder }) {

  // Creation user
  const userBugPix1321 = {
    id: 999999,
    firstName: 'vincent',
    lastName: 'youness',
    email: null,
    username: 'vincent.youness123',
    rawPassword: 'Password123',
    cgu: false,
    shouldChangePassword: true,
  };

  databaseBuilder.factory.buildUser.withUnencryptedPassword(userBugPix1321);

  // Type: SCO

  databaseBuilder.factory.buildSchoolingRegistration({
    firstName: userBugPix1321.firstName,
    lastName: userBugPix1321.lastName,
    birthdate: '2010-10-10',
    organizationId: 3,
    userId: 999999,
    nationalStudentId: '999999999B',
  });

}

module.exports = {
  usersPix1321Builder,
};

