const databaseBuffer = require('../database-buffer');

module.exports = function buildAccountRecoveryDemand({
  id = databaseBuffer.getNextId(),
  userId,
  oldEmail,
  newEmail = 'philipe@example.net',
  temporaryKey = 'OWIxZGViNGQtM2I3ZC00YmFkLTliZGQtMmIwZDdiM2RjYjZk',
  used = false,
  createdAt,
} = {}) {

  const values = {
    id,
    userId,
    oldEmail,
    newEmail,
    temporaryKey,
    used,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'account-recovery-demands',
    values,
  });
};
