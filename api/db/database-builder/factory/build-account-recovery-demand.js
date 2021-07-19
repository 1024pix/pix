const databaseBuffer = require('../database-buffer');
const buildSchoolingRegistration = require('./build-schooling-registration');

module.exports = function buildAccountRecoveryDemand({
  id = databaseBuffer.getNextId(),
  userId,
  schoolingRegistrationId,
  oldEmail,
  newEmail = 'philipe@example.net',
  temporaryKey = 'OWIxZGViNGQtM2I3ZC00YmFkLTliZGQtMmIwZDdiM2RjYjZk',
  used = false,
  createdAt,
} = {}) {
  const values = {
    id,
    userId,
    schoolingRegistrationId: schoolingRegistrationId || buildSchoolingRegistration().id,
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
