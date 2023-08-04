import { DEFAULT_PASSWORD } from '../../../constants.js';

function _buildUserBeforeBeingTemporarilyBlocked(databaseBuilder) {
  const temporaryBlockedUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Little',
    lastName: 'Bear',
    email: 'temporary-blocked@example.net',
    username: 'little.bear0101',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildUserLogin({
    userId: temporaryBlockedUser.id,
    failureCount: 9,
  });
}

export function buildTemporaryBlockedUsers(databaseBuilder) {
  _buildUserBeforeBeingTemporarilyBlocked(databaseBuilder);
}
