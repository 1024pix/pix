import { DEFAULT_PASSWORD } from '../../../constants.js';

function _buildUserBeforeBeingBlocked(databaseBuilder) {
  const blockedUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Goldi',
    lastName: 'Locks',
    email: 'blocked@example.net',
    username: 'goldi.locks0101',
    rawPassword: DEFAULT_PASSWORD,
    cgu: false,
  });

  databaseBuilder.factory.buildUserLogin({
    userId: blockedUser.id,
    failureCount: 49,
  });
}

export function buildBlockedUsers(databaseBuilder) {
  _buildUserBeforeBeingBlocked(databaseBuilder);
}
