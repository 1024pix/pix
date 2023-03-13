const { DEFAULT_PASSWORD } = require('./users-builder');
const { SCO_MIDDLE_SCHOOL_ID } = require('./organizations-sco-builder');

function userLoginsBuilder({ databaseBuilder }) {
  _buildBlockedUser({ databaseBuilder });
  _buildTemporaryBlockedUser({ databaseBuilder });
}

function _buildBlockedUser({ databaseBuilder }) {
  const blockedUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Goldi',
    lastName: 'Locks',
    email: 'blocked@example.net',
    username: 'goldi.locks0101',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildOrganizationLearner({
    firstName: blockedUser.firstName,
    lastName: blockedUser.lastName,
    birthdate: '2001-01-01',
    division: '3A',
    group: null,
    sex: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: blockedUser.id,
    nationalStudentId: '123456789GL',
  });

  databaseBuilder.factory.buildUserLogin({
    userId: blockedUser.id,
    failureCount: 49,
  });
}

function _buildTemporaryBlockedUser({ databaseBuilder }) {
  const temporaryBlockedUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Little',
    lastName: 'Bear',
    email: 'temporary-blocked@example.net',
    username: 'little.bear0101',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildOrganizationLearner({
    firstName: temporaryBlockedUser.firstName,
    lastName: temporaryBlockedUser.lastName,
    birthdate: '2001-01-01',
    division: '3A',
    group: null,
    sex: null,
    organizationId: SCO_MIDDLE_SCHOOL_ID,
    userId: temporaryBlockedUser.id,
    nationalStudentId: '123456789LB',
  });

  databaseBuilder.factory.buildUserLogin({
    userId: temporaryBlockedUser.id,
    failureCount: 9,
  });
}

module.exports = {
  userLoginsBuilder,
};
