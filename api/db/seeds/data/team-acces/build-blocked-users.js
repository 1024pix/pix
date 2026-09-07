import { config } from '../../../../config/config.js';

function _buildBlockedUser(databaseBuilder) {
  const blockedUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Goldi',
    lastName: 'Locks',
    email: 'blocked@example.net',
    username: 'goldi.locks',
    cgu: false,
  });

  databaseBuilder.factory.buildUserLogin({
    userId: blockedUser.id,
    failureCount: config.login.blockingLimitFailureCount,
    blockedAt: new Date(),
  });
}

function _buildAlmostBlockedUser(databaseBuilder) {
  const almostBlockedUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Silveri',
    lastName: 'Locks',
    email: 'almost-blocked@example.net',
    username: 'silveri.locks',
    cgu: false,
  });

  databaseBuilder.factory.buildUserLogin({
    userId: almostBlockedUser.id,
    failureCount: config.login.blockingLimitFailureCount - 1,
  });
}

function _buildAlmostTemporarilyBlockedUser(databaseBuilder) {
  const temporaryBlockedUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Small',
    lastName: 'Bear',
    email: 'almost-temporarily-blocked@example.net',
    username: 'small.bear',
    cgu: false,
  });

  databaseBuilder.factory.buildUserLogin({
    userId: temporaryBlockedUser.id,
    failureCount: config.login.temporaryBlockingThresholdFailureCount - 1,
  });
}

export function buildBlockedUsers(databaseBuilder) {
  _buildBlockedUser(databaseBuilder);
  _buildAlmostBlockedUser(databaseBuilder);
  _buildAlmostTemporarilyBlockedUser(databaseBuilder);
}
