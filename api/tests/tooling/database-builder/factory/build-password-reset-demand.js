const databaseBuffer = require('../database-buffer');

module.exports = function buildPasswordResetDemand(
  {
    id,
    email,
    temporaryKey,
    used = false,
  } = {}) {
  const values = { id, email, temporaryKey, used };

  return databaseBuffer.pushInsertable({
    tableName: 'password-reset-demands',
    values,
  });
};
