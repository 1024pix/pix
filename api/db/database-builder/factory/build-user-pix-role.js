const buildPixRole = require('./build-pix-role');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

const buildUserPixRole = function buildUserPixRole({ id = databaseBuffer.getNextId(), userId, pixRoleId } = {}) {
  pixRoleId = _.isUndefined(pixRoleId) ? buildPixRole().id : pixRoleId;

  return databaseBuffer.pushInsertable({
    tableName: 'users_pix_roles',
    values: {
      id,
      user_id: userId,
      pix_role_id: pixRoleId,
    },
  });
};

module.exports = buildUserPixRole;
